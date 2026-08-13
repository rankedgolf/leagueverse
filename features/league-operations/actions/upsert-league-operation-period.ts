"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

type UpsertLeagueOperationPeriodInput = {
  leagueId: string;
  seasonId: string;

  phase: "franchise_tag";

  action:
    | "save"
    | "open"
    | "close";

  opensAt?: string | null;
  closesAt?: string | null;
};

export async function upsertLeagueOperationPeriod(
  input: UpsertLeagueOperationPeriodInput,
) {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  const supabase =
    await createClient();

  const now =
    new Date().toISOString();

  const {
    data: existing,
    error: existingError,
  } =
    await supabase
      .from("league_operation_periods")
      .select(`
        id,
        status,
        opens_at,
        closes_at
      `)
      .eq(
        "league_id",
        input.leagueId,
      )
      .eq(
        "season_id",
        input.seasonId,
      )
      .eq(
        "phase",
        input.phase,
      )
      .maybeSingle();

  if (existingError) {
    throw new Error(
      existingError.message,
    );
  }

  if (input.action === "save") {
    if (
      !input.opensAt ||
      !input.closesAt
    ) {
      throw new Error(
        "Both opening and closing dates are required.",
      );
    }

    if (
      new Date(input.closesAt) <=
      new Date(input.opensAt)
    ) {
      throw new Error(
        "The closing date must be after the opening date.",
      );
    }

    const { error } =
      await supabase
        .from("league_operation_periods")
        .upsert(
          {
            league_id:
              input.leagueId,

            season_id:
              input.seasonId,

            phase:
              input.phase,

            status:
              existing?.status ??
              "scheduled",

            opens_at:
              input.opensAt,

            closes_at:
              input.closesAt,

            updated_at:
              now,
          },
          {
            onConflict:
              "league_id,season_id,phase",
          },
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }
  }

if (input.action === "open") {
  if (
    !input.opensAt ||
    !input.closesAt
  ) {
    throw new Error(
      "Configure both opening and closing dates before opening the Franchise Tag window.",
    );
  }

  if (
    new Date(input.closesAt) <=
    new Date(input.opensAt)
  ) {
    throw new Error(
      "The closing date must be after the opening date.",
    );
  }

  const { error } =
    await supabase
      .from("league_operation_periods")
      .upsert(
        {
          league_id:
            input.leagueId,

          season_id:
            input.seasonId,

          phase:
            input.phase,

          status:
            "open",

          opens_at:
            input.opensAt,

          closes_at:
            input.closesAt,

          opened_at:
            now,

          closed_at:
            null,

          updated_at:
            now,
        },
        {
          onConflict:
            "league_id,season_id,phase",
        },
      );

  if (error) {
    throw new Error(
      error.message,
    );
  }
}

  if (input.action === "close") {
    if (!existing) {
      throw new Error(
        "The Franchise Tag window has not been configured.",
      );
    }

    const { error } =
      await supabase
        .from("league_operation_periods")
        .update({
          status:
            "closed",

          closed_at:
            now,

          updated_at:
            now,
        })
        .eq(
          "id",
          existing.id,
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }
  }

  revalidatePath(
    `/leagues/${input.leagueId}/operations`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/rosters`,
  );

  return {
    success: true,
  };
}
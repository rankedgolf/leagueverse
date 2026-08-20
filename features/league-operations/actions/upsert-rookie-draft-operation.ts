"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

type UpsertRookieDraftOperationInput = {
  leagueId: string;
  operationSeasonId: string;
  draftSeasonId: string;

  action:
    | "save"
    | "open"
    | "close";

  opensAt: string;
  closesAt: string;

  rounds: number;
};

export async function upsertRookieDraftOperation(
  input: UpsertRookieDraftOperationInput,
) {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  if (!input.opensAt || !input.closesAt) {
    throw new Error(
      "Both Rookie Draft opening and closing dates are required.",
    );
  }

  const opensAt =
    new Date(input.opensAt);

  const closesAt =
    new Date(input.closesAt);

  if (
    closesAt <=
    opensAt
  ) {
    throw new Error(
      "The Rookie Draft closing date must be after the opening date.",
    );
  }

  const supabase =
    await createClient();

  const now =
    new Date().toISOString();

  /*
   * Draft order must be complete before opening.
   */
  if (input.action === "open") {
    const {
      data: picks,
      error: picksError,
    } =
      await supabase
        .from("draft_picks")
        .select(`
          id,
          pick_number
        `)
        .eq(
          "league_id",
          input.leagueId,
        )
        .eq(
          "season_id",
          input.draftSeasonId,
        )
        .eq(
          "status",
          "active",
        );

    if (picksError) {
      throw new Error(
        picksError.message,
      );
    }

    if (
      !picks?.length ||
      picks.some(
        (pick) =>
          pick.pick_number === null,
      )
    ) {
      throw new Error(
        "Complete the Rookie Draft order before opening the draft window.",
      );
    }
  }

  const status =
    input.action === "open"
      ? "open"
      : input.action === "close"
        ? "closed"
        : "scheduled";

  /*
   * League Operations phase
   */
  const {
    error: operationError,
  } =
    await supabase
      .from(
        "league_operation_periods",
      )
      .upsert(
        {
          league_id:
            input.leagueId,

          season_id:
            input.operationSeasonId,

          phase:
            "rookie_draft",

          status,

          opens_at:
            opensAt.toISOString(),

          closes_at:
            closesAt.toISOString(),

          opened_at:
            input.action ===
            "open"
              ? now
              : null,

          closed_at:
            input.action ===
            "close"
              ? now
              : null,

          updated_at:
            now,
        },
        {
          onConflict:
            "league_id,season_id,phase",
        },
      );

  if (operationError) {
    throw new Error(
      operationError.message,
    );
  }

  /*
   * Rookie Draft event
   */
  const {
    data: existingDraft,
    error: existingDraftError,
  } =
    await supabase
      .from("rookie_drafts")
      .select("id")
      .eq(
        "league_id",
        input.leagueId,
      )
      .eq(
        "season_id",
        input.draftSeasonId,
      )
      .maybeSingle();

  if (existingDraftError) {
    throw new Error(
      existingDraftError.message,
    );
  }

  const draftValues = {
    operation_season_id:
      input.operationSeasonId,

    name:
      `${new Date(
        opensAt,
      ).getFullYear()} Rookie Draft`,

    status:
      input.action ===
      "close"
        ? "completed"
        : status,

    rounds:
      input.rounds,

    opens_at:
      opensAt.toISOString(),

    closes_at:
      closesAt.toISOString(),

    started_at:
      input.action ===
      "open"
        ? now
        : null,

    completed_at:
      input.action ===
      "close"
        ? now
        : null,

    updated_at:
      now,
  };

  if (existingDraft) {
    const { error } =
      await supabase
        .from("rookie_drafts")
        .update(
          draftValues,
        )
        .eq(
          "id",
          existingDraft.id,
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }
  } else {
    const { error } =
      await supabase
        .from("rookie_drafts")
        .insert({
          league_id:
            input.leagueId,

          season_id:
            input.draftSeasonId,

          ...draftValues,
        });

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
    `/leagues/${input.leagueId}/draft`,
  );

  return {
    success: true,
    status,
  };
}
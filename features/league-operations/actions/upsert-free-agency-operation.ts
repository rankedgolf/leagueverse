"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

type FreeAgencyOperationAction =
  | "save"
  | "open"
  | "close";

type UpsertFreeAgencyOperationInput = {
  leagueId: string;
  seasonId: string;

  action:
    FreeAgencyOperationAction;

  opensAt: string;
  closesAt: string;
};

export async function upsertFreeAgencyOperation(
  input: UpsertFreeAgencyOperationInput,
) {
  await AuthorizationService.requirePermission({
    leagueId:
      input.leagueId,

    permission:
      Permissions.ManageLeague,
  });

  if (
    !input.opensAt ||
    !input.closesAt
  ) {
    throw new Error(
      "Both Free Agency opening and closing dates are required.",
    );
  }

  const opensAt =
    new Date(
      input.opensAt,
    );

  const closesAt =
    new Date(
      input.closesAt,
    );

  if (
    !Number.isFinite(
      opensAt.getTime(),
    ) ||
    !Number.isFinite(
      closesAt.getTime(),
    )
  ) {
    throw new Error(
      "Free Agency dates are invalid.",
    );
  }

  if (
    closesAt <=
    opensAt
  ) {
    throw new Error(
      "Free Agency must close after it opens.",
    );
  }

  const supabase =
    await createClient();

  const now =
    new Date().toISOString();

  /*
   * --------------------------------------------------
   * CONTRACT EXPIRATIONS MUST BE COMPLETE
   * --------------------------------------------------
   */
  const {
    data: expirationPhase,
    error: expirationError,
  } =
    await supabase
      .from(
        "league_operation_periods",
      )
      .select(`
        id,
        status
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
        "contract_expiration",
      )
      .maybeSingle();

  if (expirationError) {
    throw new Error(
      expirationError.message,
    );
  }

  if (
    input.action ===
      "open" &&
    expirationPhase?.status !==
      "completed"
  ) {
    throw new Error(
      "Contract expirations must be completed before Free Agency can open.",
    );
  }

  /*
   * --------------------------------------------------
   * LOAD EXISTING LEAGUE OPERATION
   * --------------------------------------------------
   */
  const {
    data: existingOperation,
    error: existingOperationError,
  } =
    await supabase
      .from(
        "league_operation_periods",
      )
      .select(`
        id,
        status,
        opened_at,
        closed_at
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
        "free_agency",
      )
      .maybeSingle();

  if (existingOperationError) {
    throw new Error(
      existingOperationError.message,
    );
  }

  /*
   * --------------------------------------------------
   * LEAGUE OPERATIONS PERIOD
   * --------------------------------------------------
   */
  const operationStatus =
    input.action === "open"
      ? "open"
      : input.action === "close"
        ? "closed"
        : "scheduled";

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
            input.seasonId,

          phase:
            "free_agency",

          status:
            operationStatus,

          opens_at:
            opensAt.toISOString(),

          closes_at:
            input.action ===
            "close"
              ? now
              : closesAt.toISOString(),

          opened_at:
            input.action ===
            "open"
              ? now
              : existingOperation
                  ?.opened_at ??
                null,

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
   * --------------------------------------------------
   * EXISTING FREE AGENCY ENGINE PERIOD
   * --------------------------------------------------
   */
  const {
    data: existingPeriod,
    error: existingPeriodError,
  } =
    await supabase
      .from(
        "free_agency_periods",
      )
      .select(`
        id,
        status
      `)
      .eq(
        "league_id",
        input.leagueId,
      )
      .eq(
        "season_id",
        input.seasonId,
      )
      .in(
        "status",
        [
          "scheduled",
          "open",
          "paused",
          "closed",
        ],
      )
      .order(
        "created_at",
        {
          ascending: false,
        },
      )
      .limit(1)
      .maybeSingle();

  if (existingPeriodError) {
    throw new Error(
      existingPeriodError.message,
    );
  }

  const freeAgencyValues = {
    name:
      `${opensAt.getFullYear()} Free Agency`,

    status:
      operationStatus,

    opens_at:
      opensAt.toISOString(),

    closes_at:
      input.action ===
      "close"
        ? now
        : closesAt.toISOString(),

    decisions_begin_at:
      opensAt.toISOString(),

    decisions_end_at:
      closesAt.toISOString(),

    decision_frequency_hours:
      24,

    next_decision_at:
      input.action ===
      "open"
        ? opensAt.toISOString()
        : null,

    updated_at:
      now,
  };

  let periodId: string;

  if (existingPeriod) {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "free_agency_periods",
        )
        .update(
          freeAgencyValues,
        )
        .eq(
          "id",
          existingPeriod.id,
        )
        .eq(
          "league_id",
          input.leagueId,
        )
        .select("id")
        .single();

    if (error) {
      throw new Error(
        error.message,
      );
    }

    periodId =
      data.id;
  } else {
    const {
      data,
      error,
    } =
      await supabase
        .from(
          "free_agency_periods",
        )
        .insert({
          league_id:
            input.leagueId,

          season_id:
            input.seasonId,

          ...freeAgencyValues,
        })
        .select("id")
        .single();

    if (error) {
      throw new Error(
        error.message,
      );
    }

    periodId =
      data.id;
  }

  revalidatePath(
    `/leagues/${input.leagueId}/operations`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/free-agency`,
  );

  return {
    success: true,

    periodId,

    status:
      operationStatus,
  };
}
"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

type CompleteFreeAgencyInput = {
  leagueId: string;
  operationSeasonId: string;
  freeAgencyPeriodId: string;
};

export type CompleteFreeAgencyResult = {
  success: boolean;

  activeOffers: number;
  unresolvedSignings: number;
};

export async function completeFreeAgency(
  input: CompleteFreeAgencyInput,
): Promise<CompleteFreeAgencyResult> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  const supabase =
    await createClient();

  /*
   * --------------------------------------------------
   * FREE AGENCY PERIOD MUST EXIST
   * --------------------------------------------------
   */
  const {
    data: period,
    error: periodError,
  } = await supabase
    .from("free_agency_periods")
    .select(`
      id,
      status
    `)
    .eq(
      "id",
      input.freeAgencyPeriodId,
    )
    .eq(
      "league_id",
      input.leagueId,
    )
    .maybeSingle();

  if (periodError) {
    throw new Error(
      periodError.message,
    );
  }

  if (!period) {
    throw new Error(
      "The Free Agency period could not be found.",
    );
  }

  if (period.status !== "closed") {
    throw new Error(
      "Close the Free Agency period before completing Free Agency.",
    );
  }

  /*
   * --------------------------------------------------
   * NO ACTIVE OFFERS MAY REMAIN
   * --------------------------------------------------
   */
  const {
    count: activeOfferCount,
    error: offerError,
  } = await supabase
    .from("free_agency_offers")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      },
    )
    .eq(
      "league_id",
      input.leagueId,
    )
    .eq(
      "free_agency_period_id",
      input.freeAgencyPeriodId,
    )
    .eq(
      "status",
      "active",
    );

  if (offerError) {
    throw new Error(
      offerError.message,
    );
  }

  const activeOffers =
    activeOfferCount ?? 0;

  if (activeOffers > 0) {
    throw new Error(
      `${activeOffers} active Free Agency offer${
        activeOffers === 1
          ? ""
          : "s"
      } must be resolved or withdrawn before Free Agency can be completed.`,
    );
  }

  /*
   * --------------------------------------------------
   * NO UNRESOLVED SIGNING TRANSACTIONS
   * --------------------------------------------------
   */
  const {
    count: unresolvedCount,
    error: transactionError,
  } = await supabase
    .from("transactions")
    .select(
      "id",
      {
        count: "exact",
        head: true,
      },
    )
    .eq(
      "league_id",
      input.leagueId,
    )
    .eq(
      "type",
      "free_agent_signing",
    )
    .in(
      "status",
      [
        "pending",
        "approved",
        "applying",
      ],
    );

  if (transactionError) {
    throw new Error(
      transactionError.message,
    );
  }

  const unresolvedSignings =
    unresolvedCount ?? 0;

  if (unresolvedSignings > 0) {
    throw new Error(
      `${unresolvedSignings} Free Agency signing transaction${
        unresolvedSignings === 1
          ? ""
          : "s"
      } still need to be applied before Free Agency can be completed.`,
    );
  }

  /*
   * --------------------------------------------------
   * COMPLETE LEAGUE OPERATIONS PHASE
   * --------------------------------------------------
   */
  const now =
    new Date().toISOString();

  const {
    error: operationError,
  } = await supabase
    .from(
      "league_operation_periods",
    )
    .update({
      status:
        "completed",

      processed_at:
        now,

      closed_at:
        now,

      updated_at:
        now,
    })
    .eq(
      "league_id",
      input.leagueId,
    )
    .eq(
      "season_id",
      input.operationSeasonId,
    )
    .eq(
      "phase",
      "free_agency",
    );

  if (operationError) {
    throw new Error(
      operationError.message,
    );
  }

  revalidatePath(
    `/leagues/${input.leagueId}/operations`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/free-agency`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/transactions`,
  );

  return {
    success: true,
    activeOffers,
    unresolvedSignings,
  };
}
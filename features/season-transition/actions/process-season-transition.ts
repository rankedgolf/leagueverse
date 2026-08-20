"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

import { requireLeagueEntitlement } from "@/features/billing/services/require-league-entitlement";

type ProcessSeasonTransitionInput = {
  leagueId: string;
  currentSeasonId: string;
};

export type ProcessSeasonTransitionResult = {
  success: boolean;

  leagueId: string;

  previousSeasonId: string;
  previousSeasonYear: number;

  newSeasonId: string;
  newSeasonYear: number;

  existingIncomingRosterRows: number;
  rosterRowsMaterialized: number;

  followingSeasonYear: number;

  processedAt: string;
};

export async function processSeasonTransition(
  input: ProcessSeasonTransitionInput,
): Promise<ProcessSeasonTransitionResult> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  await requireLeagueEntitlement(
    input.leagueId,
  );

  const supabase =
    await createClient();

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "process_season_transition",
      {
        p_league_id:
          input.leagueId,

        p_current_season_id:
          input.currentSeasonId,
      },
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  const result =
    data as
      | ProcessSeasonTransitionResult
      | null;

  if (
    !result ||
    result.success !== true
  ) {
    throw new Error(
      "Season Transition did not complete successfully.",
    );
  }

  revalidatePath(
    `/leagues/${input.leagueId}/operations`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/rosters`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/contracts`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/salary-cap`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/draft`,
  );

  return result;
}
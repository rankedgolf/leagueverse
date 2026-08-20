"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import { requireLeagueEntitlement } from "@/features/billing/services/require-league-entitlement";

export type RookieDraftImportSelectionInput = {
  round: number;
  overallPick: number;
  playerId: string;
};

type ImportRookieDraftResultsInput = {
  leagueId: string;
  draftSeasonId: string;
  selections: RookieDraftImportSelectionInput[];
};

export type ImportRookieDraftResultsResult = {
  success: boolean;

  leagueId: string;
  draftSeasonId: string;
  rookieDraftId: string;

  importedCount: number;
  processedAt: string;
};

export async function importRookieDraftResults(
  input: ImportRookieDraftResultsInput,
): Promise<ImportRookieDraftResultsResult> {
 await AuthorizationService.requirePermission({
  leagueId: input.leagueId,
  permission: Permissions.ManageLeague,
});

await requireLeagueEntitlement(
  input.leagueId,
);

if (
  input.selections.length === 0
) {
    throw new Error(
      "There are no valid rookie selections to import.",
    );
  }

  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    throw new Error(
      "You must be signed in to import rookie draft results.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "import_rookie_draft_results",
      {
        p_league_id:
          input.leagueId,

        p_draft_season_id:
          input.draftSeasonId,

        p_selections:
          input.selections,

        p_selected_by:
          user.id,
      },
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  const result =
    data as
      | ImportRookieDraftResultsResult
      | null;

  if (
    !result ||
    result.success !== true
  ) {
    throw new Error(
      "Rookie Draft import did not complete successfully.",
    );
  }

  revalidatePath(
    `/leagues/${input.leagueId}/operations`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/draft`,
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

  return result;
}
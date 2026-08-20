"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import { requireLeagueEntitlement } from "@/features/billing/services/require-league-entitlement";

type SaveRookieDraftOrderInput = {
  leagueId: string;
  draftSeasonId: string;

  teamOrder: string[];
};

export async function saveRookieDraftOrder(
  input: SaveRookieDraftOrderInput,
) {
 await AuthorizationService.requirePermission({
  leagueId: input.leagueId,
  permission: Permissions.ManageLeague,
});

await requireLeagueEntitlement(
  input.leagueId,
);

if (input.teamOrder.length === 0) {
    throw new Error(
      "Draft order must contain at least one team.",
    );
  }

  const uniqueTeams =
    Array.from(
      new Set(
        input.teamOrder,
      ),
    );

  if (
    uniqueTeams.length !==
    input.teamOrder.length
  ) {
    throw new Error(
      "Each team may appear only once in the draft order.",
    );
  }

  const supabase =
    await createClient();

  const {
    data: picks,
    error: picksError,
  } =
    await supabase
      .from("draft_picks")
      .select(`
        id,
        round,
        original_team_id,
        current_team_id,
        status
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

  if (!picks?.length) {
    throw new Error(
      "No active draft picks were found for this rookie draft.",
    );
  }

  const rounds =
    Math.max(
      ...picks.map(
        (pick) =>
          Number(
            pick.round,
          ),
      ),
    );

  const expectedTeams =
    new Set(
      picks
        .filter(
          (pick) =>
            Number(
              pick.round,
            ) === 1,
        )
        .map(
          (pick) =>
            pick.original_team_id,
        ),
    );

  if (
    input.teamOrder.length !==
    expectedTeams.size
  ) {
    throw new Error(
      "Draft order must include every original Round 1 team exactly once.",
    );
  }

  for (
    const teamId of
    input.teamOrder
  ) {
    if (
      !expectedTeams.has(
        teamId,
      )
    ) {
      throw new Error(
        "Draft order contains a team that does not own an original Round 1 pick.",
      );
    }
  }

  const updates: {
    id: string;
    pickNumber: number;
  }[] = [];

  for (
    let round = 1;
    round <= rounds;
    round += 1
  ) {
    for (
      let index = 0;
      index <
      input.teamOrder.length;
      index += 1
    ) {
      const originalTeamId =
        input.teamOrder[index];

      const pick =
        picks.find(
          (row) =>
            Number(
              row.round,
            ) === round &&
            row.original_team_id ===
              originalTeamId,
        );

      if (!pick) {
        throw new Error(
          `A Round ${round} draft pick is missing for one of the teams.`,
        );
      }

      const pickNumber =
        (round - 1) *
          input.teamOrder.length +
        index +
        1;

      updates.push({
        id:
          pick.id,

        pickNumber,
      });
    }
  }

  for (
    const update of
    updates
  ) {
    const { error } =
      await supabase
        .from("draft_picks")
        .update({
          pick_number:
            update.pickNumber,

          updated_at:
            new Date().toISOString(),
        })
        .eq(
          "id",
          update.id,
        )
        .eq(
          "league_id",
          input.leagueId,
        )
        .eq(
          "season_id",
          input.draftSeasonId,
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
    `/leagues/${input.leagueId}/draft`,
  );

  return {
    success: true,
    updatedCount:
      updates.length,
  };
}
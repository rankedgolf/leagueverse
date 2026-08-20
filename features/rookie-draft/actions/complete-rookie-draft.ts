"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import { requireLeagueEntitlement } from "@/features/billing/services/require-league-entitlement";

type Input = {
  leagueId: string;
  operationSeasonId: string;
  draftSeasonId: string;

  forfeitRemaining?: boolean;
};

export type CompleteRookieDraftResult = {
  success: boolean;

  requiresForfeit: boolean;

  remainingPicks: number;
  forfeitedPicks: number;
};

export async function completeRookieDraft(
  input: Input,
): Promise<CompleteRookieDraftResult> {
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
    data: activePicks,
    error: picksError,
  } = await supabase
    .from("draft_picks")
    .select("id")
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

  const remainingPicks =
    activePicks?.length ?? 0;

  /*
   * Tell the client that confirmation
   * is required before forfeiting picks.
   */
  if (
    remainingPicks > 0 &&
    !input.forfeitRemaining
  ) {
    return {
      success: false,

      requiresForfeit: true,

      remainingPicks,

      forfeitedPicks: 0,
    };
  }

  const now =
    new Date().toISOString();

  let forfeitedPicks = 0;

  /*
   * Commissioner explicitly approved
   * forfeiting all remaining selections.
   */
  if (
    remainingPicks > 0 &&
    input.forfeitRemaining
  ) {
    const {
      data: forfeited,
      error: forfeitError,
    } = await supabase
      .from("draft_picks")
      .update({
        status:
          "forfeited",

        updated_at:
          now,
      })
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
      )
      .select("id");

    if (forfeitError) {
      throw new Error(
        forfeitError.message,
      );
    }

    forfeitedPicks =
      forfeited?.length ?? 0;
  }

  /*
   * Complete the actual Rookie Draft event.
   */
  const {
    error: draftError,
  } = await supabase
    .from("rookie_drafts")
    .update({
      status:
        "completed",

      completed_at:
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
      input.draftSeasonId,
    );

  if (draftError) {
    throw new Error(
      draftError.message,
    );
  }

  /*
   * Complete the offseason operation phase.
   */
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
      "rookie_draft",
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
    `/leagues/${input.leagueId}/draft`,
  );

  return {
    success: true,

    requiresForfeit: false,

    remainingPicks: 0,

    forfeitedPicks,
  };
}
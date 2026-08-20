"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { FranchiseTagPreviewService } from "@/features/franchise-tags/services/franchise-tag-preview-service";
import { LeagueOperationService } from "@/features/league-operations/services/league-operation-service";

type ApplyFranchiseTagInput = {
  leagueId: string;
  contractId: string;
};

export async function applyFranchiseTag(
  input: ApplyFranchiseTagInput,
) {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be signed in to apply a franchise tag.",
    );
  }

  const preview =
    await FranchiseTagPreviewService.getPreview({
      leagueId:
        input.leagueId,

      contractId:
        input.contractId,
    });

  if (!preview.tagAvailable) {
    throw new Error(
      preview.unavailableReason ??
        "This player is not eligible for a franchise tag.",
    );
  }

  const tagWindowOpen =
    await LeagueOperationService.isPhaseOpen({
      leagueId:
        input.leagueId,

      seasonId:
        preview.expiringSeasonId,

      phase:
        "franchise_tag",
    });

  if (!tagWindowOpen) {
    throw new Error(
      "The Franchise Tag window is not open.",
    );
  }

  const {
    data: member,
    error: memberError,
  } =
    await supabase
      .from("league_members")
      .select(`
        id,
        role
      `)
      .eq(
        "league_id",
        input.leagueId,
      )
      .eq(
        "user_id",
        user.id,
      )
      .maybeSingle();

  if (memberError) {
    throw new Error(
      memberError.message,
    );
  }

  if (!member) {
    throw new Error(
      "You are not a member of this league.",
    );
  }

  const {
    data: team,
    error: teamError,
  } =
    await supabase
      .from("teams")
      .select(`
        id,
        owner_member_id
      `)
      .eq(
        "league_id",
        input.leagueId,
      )
      .eq(
        "id",
        preview.teamId,
      )
      .maybeSingle();

  if (teamError) {
    throw new Error(
      teamError.message,
    );
  }

  if (!team) {
    throw new Error(
      "The player's team could not be found.",
    );
  }

  const isCommissioner =
    member.role === "commissioner" ||
    member.role === "co_commissioner";

  const isTeamOwner =
    team.owner_member_id ===
    member.id;

  if (
    !isCommissioner &&
    !isTeamOwner
  ) {
    throw new Error(
      "You can only apply a franchise tag to a player on your own team.",
    );
  }

  const now =
    new Date().toISOString();

  const {
    data: usage,
    error,
  } =
    await supabase
      .from("franchise_tag_usages")
      .insert({
        league_id:
          input.leagueId,

        team_id:
          preview.teamId,

        season_id:
          preview.tagSeasonId,

        league_player_id:
          preview.leaguePlayerId,

        source_contract_id:
          preview.contractId,

        tagged_contract_id:
          null,

        transaction_id:
          null,

        previous_cap_hit:
          preview.previousCapHit,

        tag_cap_hit:
          preview.tagCapHit,

        created_at:
          now,

        updated_at:
          now,
      })
      .select(`
        id,
        league_id,
        team_id,
        season_id,
        league_player_id,
        previous_cap_hit,
        tag_cap_hit
      `)
      .single();

  if (error) {
    if (
      error.code === "23505"
    ) {
      throw new Error(
        "This team has already used its franchise tag for this season.",
      );
    }

    throw new Error(
      error.message,
    );
  }

  revalidatePath(
    `/leagues/${input.leagueId}/rosters`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/operations`,
  );

  return {
    success: true,

    usageId:
      usage.id,

    playerName:
      preview.playerName,

    tagSeasonName:
      preview.tagSeasonName,

    tagCapHit:
      preview.tagCapHit,
  };
}
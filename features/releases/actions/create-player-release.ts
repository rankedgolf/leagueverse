"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { ReleasePreviewService } from "@/features/releases/services/release-preview-service";

import { TransactionBuilder } from "@/features/transactions/builders/transaction-builder";
import { TransactionRepository } from "@/features/transactions/repositories/transaction-repository";

type CreatePlayerReleaseInput = {
  leagueId: string;
  contractId: string;
};

export async function createPlayerRelease(
  input: CreatePlayerReleaseInput,
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
      "You must be signed in to release a player.",
    );
  }

  /*
   * Always recalculate the release
   * consequences on the server.
   */
  const preview =
    await ReleasePreviewService.getPreview({
      leagueId:
        input.leagueId,

      contractId:
        input.contractId,
    });

  /*
   * Find this user's membership
   * in the league.
   */
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

  /*
   * Load the team that currently
   * owns the contract.
   */
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

  /*
   * Commissioner and co-commissioner
   * may release players for any team.
   *
   * Owners may release only players
   * from their assigned team.
   */
  const isCommissioner =
    member.role ===
      "commissioner" ||
    member.role ===
      "co_commissioner";

  const isTeamOwner =
    team.owner_member_id ===
      member.id;

  if (
    !isCommissioner &&
    !isTeamOwner
  ) {
    throw new Error(
      "You do not have permission to release this player.",
    );
  }

  const currentYear =
    preview.years.find(
      (year) =>
        year.seasonId ===
        preview.currentSeasonId,
    );

  if (!currentYear) {
    throw new Error(
      "The active contract year could not be found.",
    );
  }

  const built =
    TransactionBuilder.playerRelease(
      {
        leagueId:
          input.leagueId,

        seasonId:
          preview.currentSeasonId,

        createdBy:
          user.id,

        teamId:
          preview.teamId,

        playerId:
          preview.playerId,

        leaguePlayerId:
          preview.leaguePlayerId,

        contractId:
          preview.contractId,

        playerName:
          preview.playerName,

        currentCapHit:
          currentYear.currentCapHit,

        deadCapSchedule:
          preview.years.map(
            (year) => ({
              seasonId:
                year.seasonId,

              seasonYear:
                year.seasonYear,

              amount:
                year.deadCap,
            }),
          ),

        totalDeadCap:
          preview.totalDeadCap,

        totalCapSavings:
          preview.totalCapSavings,

        notes:
          `${preview.playerName} release submitted.`,
      },
    );

  const transaction =
    await TransactionRepository.create(
      built.transaction,
    );

  revalidatePath(
    `/leagues/${input.leagueId}/rosters`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/transactions`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/salary-cap`,
  );

  return {
    transactionId:
      transaction.id,

    status:
      transaction.status,

    playerName:
      preview.playerName,

    totalDeadCap:
      preview.totalDeadCap,

    totalCapSavings:
      preview.totalCapSavings,
  };
}
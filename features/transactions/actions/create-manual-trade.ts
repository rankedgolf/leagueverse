"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import type { TransactionDTO } from "@/features/transactions/dto/transaction-dto";
import { TradeTransactionService } from "@/features/transactions/services/trade-transaction-service";

type CreateManualTradeInput = {
  leagueId: string;
  seasonId: string;

  teamAId: string;
  teamBId: string;

  playerIdsFromTeamA: string[];
  playerIdsFromTeamB: string[];

  draftPickIdsFromTeamA: string[];
  draftPickIdsFromTeamB: string[];

  notes?: string | null;
};

export async function createManualTrade(
  input: CreateManualTradeInput,
): Promise<TransactionDTO> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be signed in to create a trade.",
    );
  }

  if (!input.teamAId || !input.teamBId) {
    throw new Error(
      "Select both teams before creating the trade.",
    );
  }

  if (input.teamAId === input.teamBId) {
    throw new Error(
      "A trade requires two different teams.",
    );
  }

  if (
    input.playerIdsFromTeamA.length === 0 &&
    input.playerIdsFromTeamB.length === 0 &&
    input.draftPickIdsFromTeamA.length === 0 &&
    input.draftPickIdsFromTeamB.length === 0
  ) {
    throw new Error(
      "Select at least one player or draft pick to trade.",
    );
  }

  const transaction =
    await TradeTransactionService.createManualTrade({
      leagueId: input.leagueId,
      seasonId: input.seasonId,
      createdBy: user.id,

      teamAId: input.teamAId,
      teamBId: input.teamBId,

      playerIdsFromTeamA:
        input.playerIdsFromTeamA,

      playerIdsFromTeamB:
        input.playerIdsFromTeamB,

      draftPickIdsFromTeamA:
        input.draftPickIdsFromTeamA,

      draftPickIdsFromTeamB:
        input.draftPickIdsFromTeamB,

      notes: input.notes,
    });

  revalidatePath(
    `/leagues/${input.leagueId}/transactions`,
  );

  return transaction;
}
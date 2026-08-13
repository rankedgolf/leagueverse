import type {
  BuiltTransaction,
  FreeAgentSigningTransactionBuilderInput,
  PlayerReleaseTransactionBuilderInput,
  TradeDraftPickAssetInput,
  TradePlayerAssetInput,
  TradeTransactionBuilderInput,
} from "@/features/transactions/builders/transaction-builder-types";

import type {
  CreateTransactionInput,
  CreateTransactionItemInput,
} from "@/features/transactions/dto/transaction-dto";

function buildPlayerItem(
  player: TradePlayerAssetInput,
): CreateTransactionItemInput {
  return {
    leagueId: "",

    fromTeamId: player.fromTeamId,
    toTeamId: player.toTeamId,

    playerId: player.playerId,
    leaguePlayerId: player.leaguePlayerId,
    contractId: player.contractId ?? null,
    draftPickId: null,

    itemType: "player",

    rosterAction: "move",
    contractAction: player.contractId
  ? "transfer"
  : "none",

    salaryBefore:
      player.salaryBefore ?? null,

    salaryAfter:
      player.salaryAfter ?? null,

    metadata: {
      playerName:
        player.playerName ?? null,
    },
  };
}

function buildDraftPickItem(
  pick: TradeDraftPickAssetInput,
): CreateTransactionItemInput {
  return {
    leagueId: "",

    fromTeamId: pick.fromTeamId,
    toTeamId: pick.toTeamId,

    playerId: null,
    leaguePlayerId: null,
    contractId: null,
    draftPickId: pick.draftPickId,

    itemType: "draft_pick",

    rosterAction: null,
    contractAction: null,

    salaryBefore: null,
    salaryAfter: null,

    metadata: {
      seasonId: pick.seasonId,
      seasonYear: pick.seasonYear,
      round: pick.round,

      originalTeamId:
        pick.originalTeamId,

      originalTeamName:
        pick.originalTeamName ?? null,
    },
  };
}

export const TransactionBuilder = {
    freeAgentSigning(
  input: FreeAgentSigningTransactionBuilderInput,
): BuiltTransaction {
  if (input.contractYears < 1) {
    throw new Error(
      "A free-agent signing must contain at least one contract year.",
    );
  }

  if (input.salaryStructure.length !== input.contractYears) {
    throw new Error(
      "Free-agent signing salary structure does not match the contract length.",
    );
  }

  const item: CreateTransactionItemInput = {
    leagueId: input.leagueId,

    fromTeamId: null,
    toTeamId: input.teamId,

    playerId: input.playerId,
    leaguePlayerId: input.leaguePlayerId,

    contractId: null,
    draftPickId: null,

    itemType: "player",

    rosterAction: "add",
    contractAction: "create",

    salaryBefore: 0,
    salaryAfter: input.yearOneSalary,

    metadata: {
      playerName:
        input.playerName ?? null,

      freeAgencyOfferId:
        input.freeAgencyOfferId,

      freeAgencyPeriodId:
        input.freeAgencyPeriodId,

      contractYears:
        input.contractYears,

      totalValue:
        input.totalValue,

      guaranteedValue:
        input.guaranteedValue,

      signingBonus:
        input.signingBonus,

      yearOneSalary:
        input.yearOneSalary,

      salaryStructure:
        input.salaryStructure,
    },
  };

  const transaction: CreateTransactionInput = {
    leagueId: input.leagueId,
    seasonId: input.seasonId,

    type: "free_agent_signing",
    status: "pending",

    source: "system",

    provider: null,
    providerTransactionId: null,

    occurredAt:
      new Date().toISOString(),

    createdBy:
      input.createdBy ?? null,

    notes:
      input.notes ??
      `${input.playerName ?? "Free agent"} signing created by LeagueVerse Free Agency.`,

    metadata: {
      teamId:
        input.teamId,

      leaguePlayerId:
        input.leaguePlayerId,

      freeAgencyOfferId:
        input.freeAgencyOfferId,

      freeAgencyPeriodId:
        input.freeAgencyPeriodId,

      createdThrough:
        "free_agency_decision_engine",
    },

    items: [item],
  };

  return {
    transaction,
    items: [item],
  };
},

playerRelease(
  input: PlayerReleaseTransactionBuilderInput,
): BuiltTransaction {
  if (!input.contractId) {
    throw new Error(
      "A player release requires an active contract.",
    );
  }

  const item: CreateTransactionItemInput = {
    leagueId:
      input.leagueId,

    fromTeamId:
      input.teamId,

    toTeamId:
      null,

    playerId:
      input.playerId,

    leaguePlayerId:
      input.leaguePlayerId,

    contractId:
      input.contractId,

    draftPickId:
      null,

    itemType:
      "player",

    rosterAction:
      "drop",

    contractAction:
      "terminate",

    salaryBefore:
      input.currentCapHit,

    salaryAfter:
      0,

    metadata: {
      playerName:
        input.playerName ?? null,

      deadCapSchedule:
        input.deadCapSchedule,

      totalDeadCap:
        input.totalDeadCap,

      totalCapSavings:
        input.totalCapSavings,
    },
  };

  const transaction: CreateTransactionInput = {
    leagueId:
      input.leagueId,

    seasonId:
      input.seasonId,

    type:
      "player_release",

    status:
      "pending",

    source:
      "manual",

    provider:
      null,

    providerTransactionId:
      null,

    occurredAt:
      new Date().toISOString(),

    createdBy:
      input.createdBy,

    notes:
      input.notes ??
      `${input.playerName ?? "Player"} release submitted.`,

    metadata: {
      teamId:
        input.teamId,

      leaguePlayerId:
        input.leaguePlayerId,

      contractId:
        input.contractId,

      totalDeadCap:
        input.totalDeadCap,

      totalCapSavings:
        input.totalCapSavings,

      createdThrough:
        "player_release",
    },

    items: [item],
  };

  return {
    transaction,
    items: [item],
  };
},

  trade(
    input: TradeTransactionBuilderInput,
  ): BuiltTransaction {
    if (
      input.playersFromTeamA.length === 0 &&
      input.playersFromTeamB.length === 0 &&
      input.draftPicksFromTeamA.length === 0 &&
      input.draftPicksFromTeamB.length === 0
    ) {
      throw new Error(
        "A trade must contain at least one asset.",
      );
    }

    const items: CreateTransactionItemInput[] = [
      ...input.playersFromTeamA.map(
        (player) =>
          buildPlayerItem({
            ...player,
            fromTeamId:
              input.teamAId,
            toTeamId:
              input.teamBId,
          }),
      ),

      ...input.playersFromTeamB.map(
        (player) =>
          buildPlayerItem({
            ...player,
            fromTeamId:
              input.teamBId,
            toTeamId:
              input.teamAId,
          }),
      ),

      ...input.draftPicksFromTeamA.map(
        (pick) =>
          buildDraftPickItem({
            ...pick,
            fromTeamId:
              input.teamAId,
            toTeamId:
              input.teamBId,
          }),
      ),

      ...input.draftPicksFromTeamB.map(
        (pick) =>
          buildDraftPickItem({
            ...pick,
            fromTeamId:
              input.teamBId,
            toTeamId:
              input.teamAId,
          }),
      ),
    ].map((item) => ({
      ...item,
      leagueId: input.leagueId,
    }));

 const transaction: CreateTransactionInput = {
  leagueId: input.leagueId,
  seasonId: input.seasonId,

  type: "trade",
  status: "pending",

  source: input.source ?? "manual",

  provider: null,
  providerTransactionId: null,

  occurredAt: new Date().toISOString(),

  createdBy: input.createdBy,

  notes:
    input.notes ??
    "Manual trade created in LeagueVerse.",

  metadata: {
    teamAId: input.teamAId,
    teamBId: input.teamBId,

    playerCount:
      input.playersFromTeamA.length +
      input.playersFromTeamB.length,

    draftPickCount:
      input.draftPicksFromTeamA.length +
      input.draftPicksFromTeamB.length,

    assetCount: items.length,

    createdThrough:
      "transaction_builder",
  },

  items,
};

    return {
      transaction,
      items,
    };
  },
};
import { createClient } from "@/lib/supabase/server";

import { DraftPickRepository } from "@/features/draft-picks/repositories/draft-pick-repository";
import { TransactionBuilder } from "@/features/transactions/builders/transaction-builder";
import type {
  TradeDraftPickAssetInput,
  TradePlayerAssetInput,
} from "@/features/transactions/builders/transaction-builder-types";
import { TransactionRepository } from "@/features/transactions/repositories/transaction-repository";

type CreateManualTradeInput = {
  leagueId: string;
  seasonId: string;
  createdBy: string;

  teamAId: string;
  teamBId: string;

  playerIdsFromTeamA: string[];
  playerIdsFromTeamB: string[];

  draftPickIdsFromTeamA: string[];
  draftPickIdsFromTeamB: string[];

  notes?: string | null;
};

type LeaguePlayerRelation = {
  full_name: string;
  display_name: string | null;
};

type ContractRelation = {
  id: string;
  team_id: string;
  status: string;
  total_value: number | string | null;
};

type LeaguePlayerRow = {
  id: string;
  player_id: string;
  current_team_id: string | null;

  players:
    | LeaguePlayerRelation
    | LeaguePlayerRelation[]
    | null;

  contracts:
    | ContractRelation
    | ContractRelation[]
    | null;
};

type DraftPickSeasonRelation = {
  id: string;
  name: string;
  year: number;
};

type DraftPickTeamRelation = {
  id: string;
  name: string;
};

type DraftPickRow = {
  id: string;
  league_id: string;
  season_id: string;
  round: number;
  original_team_id: string;
  current_team_id: string;
  status: string;

  seasons:
    | DraftPickSeasonRelation
    | DraftPickSeasonRelation[]
    | null;

  original_team:
    | DraftPickTeamRelation
    | DraftPickTeamRelation[]
    | null;
};

function unwrapRelation<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

async function resolveTradePlayers(params: {
  leagueId: string;
  teamId: string;
  destinationTeamId: string;
  playerIds: string[];
}): Promise<TradePlayerAssetInput[]> {
  if (params.playerIds.length === 0) {
    return [];
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("league_players")
    .select(`
      id,
      player_id,
      current_team_id,
      players (
        full_name,
        display_name
      ),
      contracts (
        id,
        team_id,
        status,
        total_value
      )
    `)
    .eq("league_id", params.leagueId)
    .eq("current_team_id", params.teamId)
    .in("player_id", params.playerIds);

  if (error) {
    throw new Error(error.message);
  }

  const rows =
    (data ?? []) as unknown as LeaguePlayerRow[];

  if (rows.length !== params.playerIds.length) {
    throw new Error(
      "One or more selected players are not currently owned by the expected team.",
    );
  }

  return rows.map((row) => {
    const player =
      unwrapRelation(row.players);

    const activeContract =
      Array.isArray(row.contracts)
        ? row.contracts.find(
            (contract) =>
              contract.status === "active",
          ) ?? null
        : row.contracts?.status === "active"
          ? row.contracts
          : null;

    const totalValue =
      activeContract?.total_value !== null &&
      activeContract?.total_value !== undefined
        ? Number(activeContract.total_value)
        : null;

    return {
      playerId: row.player_id,
      leaguePlayerId: row.id,

      contractId:
        activeContract?.id ?? null,

      fromTeamId: params.teamId,
      toTeamId:
        params.destinationTeamId,

      playerName:
        player?.display_name ??
        player?.full_name ??
        null,

      salaryBefore: totalValue,
      salaryAfter: totalValue,
    };
  });
}

async function resolveTradeDraftPicks(params: {
  leagueId: string;
  teamId: string;
  destinationTeamId: string;
  draftPickIds: string[];
}): Promise<TradeDraftPickAssetInput[]> {
  if (params.draftPickIds.length === 0) {
    return [];
  }

  const rows =
    (await DraftPickRepository.getByIds({
      leagueId: params.leagueId,
      draftPickIds:
        params.draftPickIds,
    })) as unknown as DraftPickRow[];

  if (rows.length !== params.draftPickIds.length) {
    throw new Error(
      "One or more selected draft picks could not be found.",
    );
  }

  return rows.map((row) => {
    if (
      row.current_team_id !== params.teamId
    ) {
      throw new Error(
        "One or more selected draft picks are not currently owned by the expected team.",
      );
    }

    if (row.status !== "active") {
      throw new Error(
        "Only active draft picks can be traded.",
      );
    }

    const season =
      unwrapRelation(row.seasons);

    if (!season) {
      throw new Error(
        `Draft pick ${row.id} does not have a valid season.`,
      );
    }

    const originalTeam =
      unwrapRelation(row.original_team);

    return {
      draftPickId: row.id,

      fromTeamId: params.teamId,
      toTeamId:
        params.destinationTeamId,

      seasonId: row.season_id,
      seasonYear: season.year,

      round: row.round,

      originalTeamId:
        row.original_team_id,

      originalTeamName:
        originalTeam?.name ?? null,
    };
  });
}

export const TradeTransactionService = {
  async createManualTrade(
    input: CreateManualTradeInput,
  ) {
    if (
      input.teamAId === input.teamBId
    ) {
      throw new Error(
        "A trade requires two different teams.",
      );
    }

    const assetCount =
      input.playerIdsFromTeamA.length +
      input.playerIdsFromTeamB.length +
      input.draftPickIdsFromTeamA.length +
      input.draftPickIdsFromTeamB.length;

    if (assetCount === 0) {
      throw new Error(
        "Select at least one player or draft pick for the trade.",
      );
    }

    const [
      playersFromTeamA,
      playersFromTeamB,
      draftPicksFromTeamA,
      draftPicksFromTeamB,
    ] = await Promise.all([
      resolveTradePlayers({
        leagueId: input.leagueId,
        teamId: input.teamAId,
        destinationTeamId:
          input.teamBId,
        playerIds:
          input.playerIdsFromTeamA,
      }),

      resolveTradePlayers({
        leagueId: input.leagueId,
        teamId: input.teamBId,
        destinationTeamId:
          input.teamAId,
        playerIds:
          input.playerIdsFromTeamB,
      }),

      resolveTradeDraftPicks({
        leagueId: input.leagueId,
        teamId: input.teamAId,
        destinationTeamId:
          input.teamBId,
        draftPickIds:
          input.draftPickIdsFromTeamA,
      }),

      resolveTradeDraftPicks({
        leagueId: input.leagueId,
        teamId: input.teamBId,
        destinationTeamId:
          input.teamAId,
        draftPickIds:
          input.draftPickIdsFromTeamB,
      }),
    ]);

    const built =
      TransactionBuilder.trade({
        leagueId: input.leagueId,
        seasonId: input.seasonId,
        createdBy: input.createdBy,

        teamAId: input.teamAId,
        teamBId: input.teamBId,

        playersFromTeamA,
        playersFromTeamB,

        draftPicksFromTeamA,
        draftPicksFromTeamB,

        notes: input.notes,
        source: "manual",
      });

    return TransactionRepository.create(
      built.transaction,
    );
  },
};
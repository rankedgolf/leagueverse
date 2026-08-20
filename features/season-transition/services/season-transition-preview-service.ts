import type { SeasonTransitionPreviewDTO } from "@/features/season-transition/dto/season-transition-preview-dto";

import { SeasonTransitionRepository } from "@/features/season-transition/repositories/season-transition-repository";

import { SeasonService } from "@/features/seasons/services/season-service";

function unwrapRelation<T>(
  value:
    | T
    | T[]
    | null
    | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

type LeaguePlayerRelation = {
  id: string;
  player_id: string;
  current_team_id: string | null;
};

type ContractRelation = {
  id: string;
  status: string;
  league_player_id: string;
  team_id: string;

  league_players:
    | LeaguePlayerRelation
    | LeaguePlayerRelation[]
    | null;
};

export const SeasonTransitionPreviewService = {
  async getPreview(params: {
    leagueId: string;
  }): Promise<SeasonTransitionPreviewDTO> {
    const [
      activeSeason,
      seasons,
    ] = await Promise.all([
      SeasonService.getActiveSeasonByLeague(
        params.leagueId,
      ),

      SeasonService.getLeagueSeasons(
        params.leagueId,
      ),
    ]);

    if (!activeSeason) {
      throw new Error(
        "This league does not have an active season.",
      );
    }

    const currentYear =
      Number(
        activeSeason.year,
      );

    const nextSeason =
      seasons
        .filter(
          (season) =>
            Number(
              season.year,
            ) >
            currentYear,
        )
        .sort(
          (a, b) =>
            Number(
              a.year,
            ) -
            Number(
              b.year,
            ),
        )[0];

    if (!nextSeason) {
      throw new Error(
        "The incoming season could not be found.",
      );
    }

    const [
      contractRows,
      rosterRows,
      operations,
    ] = await Promise.all([
      SeasonTransitionRepository.getEligiblePlayers(
        {
          leagueId:
            params.leagueId,

          seasonId:
            nextSeason.id,
        },
      ),

      SeasonTransitionRepository.getRosterRows(
        {
          leagueId:
            params.leagueId,

          seasonId:
            nextSeason.id,
        },
      ),

      SeasonTransitionRepository.getOperations(
        {
          leagueId:
            params.leagueId,

          seasonId:
            activeSeason.id,
        },
      ),
    ]);

    const eligiblePlayers =
      new Map<
        string,
        {
          playerId: string;
          teamId: string;
        }
      >();

    for (
      const row of
      contractRows
    ) {
      const contract =
        unwrapRelation(
          row.contracts as
            | ContractRelation
            | ContractRelation[]
            | null,
        );

      if (!contract) {
        continue;
      }

      const leaguePlayer =
        unwrapRelation(
          contract.league_players,
        );

      if (
        !leaguePlayer ||
        !leaguePlayer.current_team_id
      ) {
        continue;
      }

      eligiblePlayers.set(
        leaguePlayer.player_id,
        {
          playerId:
            leaguePlayer.player_id,

          teamId:
            leaguePlayer.current_team_id,
        },
      );
    }

    const existingPlayerIds =
      new Set(
        rosterRows.map(
          (row) =>
            row.player_id,
        ),
      );

    const playersToCarryForward =
      Array.from(
        eligiblePlayers.values(),
      ).filter(
        (player) =>
          !existingPlayerIds.has(
            player.playerId,
          ),
      ).length;

    const operationMap =
      new Map(
        operations.map(
          (operation) => [
            operation.phase,
            operation.status,
          ],
        ),
      );

    const rosterComplianceComplete =
      operationMap.get(
        "roster_compliance",
      ) === "completed";

    const freeAgencyStatus =
      operationMap.get(
        "free_agency",
      );

    const rookieDraftStatus =
      operationMap.get(
        "rookie_draft",
      );

    const freeAgencyClosed =
      !freeAgencyStatus ||
      freeAgencyStatus ===
        "closed" ||
      freeAgencyStatus ===
        "completed";

    const rookieDraftClosed =
      !rookieDraftStatus ||
      rookieDraftStatus ===
        "closed" ||
      rookieDraftStatus ===
        "completed";

    const readyToTransition =
      rosterComplianceComplete &&
      freeAgencyClosed &&
      rookieDraftClosed;

    return {
      leagueId:
        params.leagueId,

      currentSeasonId:
        activeSeason.id,

      currentSeasonName:
        activeSeason.name,

      currentSeasonYear:
        currentYear,

      nextSeasonId:
        nextSeason.id,

      nextSeasonName:
        nextSeason.name,

      nextSeasonYear:
        Number(
          nextSeason.year,
        ),

      followingSeasonYear:
        Number(
          nextSeason.year,
        ) + 1,

      eligiblePlayerCount:
        eligiblePlayers.size,

      existingRosterCount:
        rosterRows.length,

      playersToCarryForward,

      rosterComplianceComplete,

      freeAgencyClosed,

      rookieDraftClosed,

      readyToTransition,
    };
  },
};
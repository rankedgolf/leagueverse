import type {
  LeagueOperationPeriodDTO,
  LeagueOperationPhase,
} from "@/features/league-operations/dto/league-operation-period-dto";

import { LeagueOperationRepository } from "@/features/league-operations/repositories/league-operation-repository";

export const LeagueOperationService = {
  async getSeasonOperations(params: {
    leagueId: string;
    seasonId: string;
  }): Promise<LeagueOperationPeriodDTO[]> {
    const rows =
      await LeagueOperationRepository.getByLeagueAndSeason(
        params,
      );

    return rows.map(
      (row) => ({
        id:
          row.id,

        leagueId:
          row.league_id,

        seasonId:
          row.season_id,

        phase:
          row.phase,

        status:
          row.status,

        opensAt:
          row.opens_at,

        closesAt:
          row.closes_at,

        openedAt:
          row.opened_at,

        closedAt:
          row.closed_at,

        processedAt:
          row.processed_at,
      }),
    );
  },

  async getPhase(params: {
    leagueId: string;
    seasonId: string;
    phase: LeagueOperationPhase;
  }) {
    return LeagueOperationRepository.getPhase(
      params,
    );
  },

  async isPhaseOpen(params: {
    leagueId: string;
    seasonId: string;
    phase: LeagueOperationPhase;
  }) {
    const period =
      await LeagueOperationRepository.getPhase(
        params,
      );

    return (
      period?.status ===
      "open"
    );
  },
};
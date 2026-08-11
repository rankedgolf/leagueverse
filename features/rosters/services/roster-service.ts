import type {
  RosterContractDTO,
  RosterPlayerDTO,
} from "@/features/rosters/dto/roster-player-dto";

import { RosterRepository } from "@/features/rosters/repositories/roster-repository";

function unwrapRelation<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function toNumber(
  value: number | string | null | undefined,
): number {
  if (value === null || value === undefined) {
    return 0;
  }

  const parsed = Number(value);

  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

export const RosterService = {
  async getLeagueRosterPlayers(
    leagueId: string,
    seasonId: string,
  ): Promise<RosterPlayerDTO[]> {
    const [
      rows,
      contracts,
    ] = await Promise.all([
      RosterRepository.getByLeagueAndSeason(
        leagueId,
        seasonId,
      ),

      RosterRepository.getActiveContractsByLeague(
        leagueId,
      ),
    ]);

    const contractsByPlayerId =
      new Map<
        string,
        RosterContractDTO
      >();

    for (const contract of contracts) {
      const leaguePlayer =
        unwrapRelation(
          contract.league_players,
        );

      if (!leaguePlayer) {
        continue;
      }

      const years = (
        contract.contract_years ??
        []
      )
        .map((year) => {
          const season =
            unwrapRelation(
              year.seasons,
            );

          const salary =
            toNumber(
              year.salary,
            );

          const bonus =
            toNumber(
              year.bonus,
            );

          return {
            seasonId:
              year.season_id,

            seasonYear:
              Number(
                season?.year ??
                0,
              ),

            salary,

            bonus,

            capHit:
              salary + bonus,

            guaranteedAmount:
              toNumber(
                year.guaranteed_amount,
              ),
          };
        })
        .sort(
          (a, b) =>
            a.seasonYear -
            b.seasonYear,
        );

      const currentYear =
        years.find(
          (year) =>
            year.seasonId ===
            seasonId,
        );

      const remainingYears =
        currentYear
          ? years.filter(
              (year) =>
                year.seasonYear >=
                currentYear.seasonYear,
            ).length
          : years.length;

      contractsByPlayerId.set(
        leaguePlayer.player_id,
        {
          contractId:
            contract.id,

          contractType:
            contract.contract_type,

          source:
            contract.source,

          totalValue:
            toNumber(
              contract.total_value,
            ),

          guaranteedValue:
            toNumber(
              contract.guaranteed_value,
            ),

          startsSeasonId:
            contract.starts_season_id,

          endsSeasonId:
            contract.ends_season_id,

          currentCapHit:
            currentYear
              ? currentYear.capHit
              : null,

          remainingYears,

          years,
        },
      );
    }

    return rows.map((row) => {
      const team =
        unwrapRelation(
          row.teams,
        );

      const player =
        unwrapRelation(
          row.players,
        );

      return {
        rosterId:
          row.id,

        teamId:
          row.team_id,

        teamName:
          team?.name ??
          "Unknown Team",

        playerId:
          row.player_id,

        playerName:
          [
            player?.first_name,
            player?.last_name,
          ]
            .filter(Boolean)
            .join(" ") ||
          "Unknown Player",

        position:
          player?.position ??
          null,

        proTeam:
          player?.pro_team ??
          null,

        rosterSlot:
          row.roster_slot,

        contract:
          contractsByPlayerId.get(
            row.player_id,
          ) ?? null,
      };
    });
  },
};
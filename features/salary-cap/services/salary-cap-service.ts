import type {
  CapHealthStatus,
  LeagueSalaryCapDTO,
  LargestContractDTO,
  TeamCapPlayerDTO,
  TeamSalaryCapDTO,
  TeamSeasonCapDTO,
} from "@/features/salary-cap/dto/salary-cap-dto";

import { SalaryCapRepository } from "@/features/salary-cap/repositories/salary-cap-repository";
import { ContractSettingsService } from "@/features/contracts/services/contract-settings-service";
import { SeasonService } from "@/features/seasons/services/season-service";

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function calculateUsagePercentage(
  committed: number,
  salaryCap: number
): number {
  if (salaryCap <= 0) {
    return 0;
  }

  return Math.round((committed / salaryCap) * 1000) / 10;
}

function getCapHealth(params: {
  currentCapSpace: number;
  futureCommitments: TeamSeasonCapDTO[];
}): {
  status: CapHealthStatus;
  message: string;
} {
  if (params.currentCapSpace < 0) {
    return {
      status: "over_cap",
      message: "Currently over the salary cap",
    };
  }

  const futureOverCap = params.futureCommitments.find(
    (season) => season.capSpace < 0
  );

  if (futureOverCap) {
    return {
      status: "over_cap",
      message: `Projected over cap in ${futureOverCap.seasonName}`,
    };
  }

  const tightFutureSeason = params.futureCommitments.find(
    (season) => season.usagePercentage >= 85
  );

  if (tightFutureSeason) {
    return {
      status: "watch",
      message: `Cap pressure in ${tightFutureSeason.seasonName}`,
    };
  }

  return {
    status: "healthy",
    message: "Healthy future cap position",
  };
}

export const SalaryCapService = {
  async getLeagueSalaryCap(
    leagueId: string
  ): Promise<LeagueSalaryCapDTO> {
    const [
      settings,
      activeSeason,
      teams,
      capRows,
      rosterRows,
    ] = await Promise.all([
      ContractSettingsService.getByLeague(leagueId),
      SeasonService.getActiveSeasonByLeague(leagueId),
      SalaryCapRepository.getTeamsByLeague(leagueId),
      SalaryCapRepository.getLeagueCapData(leagueId),
      SalaryCapRepository.getRosterPlayerCounts(leagueId),
    ]);

    if (!activeSeason) {
      throw new Error(
        "This league does not have an active season."
      );
    }

    const seasonMap = new Map<
      string,
      {
        id: string;
        name: string;
        year: number;
      }
    >();

    for (const row of capRows) {
      const season = Array.isArray(row.seasons)
        ? row.seasons[0]
        : row.seasons;

      if (!season) {
        continue;
      }

      seasonMap.set(season.id, {
        id: season.id,
        name: season.name,
        year: Number(season.year ?? 0),
      });
    }

    const orderedSeasons = Array.from(
      seasonMap.values()
    ).sort((a, b) => a.year - b.year);

    const largestContracts: LargestContractDTO[] = [];

    const teamDtos: TeamSalaryCapDTO[] = teams.map(
      (team) => {
        const teamCapRows = capRows.filter((row) => {
          const contract = Array.isArray(row.contracts)
            ? row.contracts[0]
            : row.contracts;

          return contract?.team_id === team.id;
        });

        const futureCommitments: TeamSeasonCapDTO[] =
          orderedSeasons.map((season) => {
            const committed = roundCurrency(
              teamCapRows
                .filter(
                  (row) => row.season_id === season.id
                )
                .reduce(
                  (total, row) =>
                    total +
                    Number(row.salary ?? 0) +
                    Number(row.bonus ?? 0),
                  0
                )
            );

            return {
              seasonId: season.id,
              seasonName: season.name,
              seasonYear: season.year,
              committed,
              capSpace: roundCurrency(
                settings.salaryCap - committed
              ),
              usagePercentage:
                calculateUsagePercentage(
                  committed,
                  settings.salaryCap
                ),
            };
          });

        const currentCommitted =
          futureCommitments.find(
            (season) =>
              season.seasonId === activeSeason.id
          )?.committed ?? 0;

        const currentCapSpace = roundCurrency(
          settings.salaryCap - currentCommitted
        );

        const currentUsagePercentage =
          calculateUsagePercentage(
            currentCommitted,
            settings.salaryCap
          );

        const contractGroups = new Map<
          string,
          typeof teamCapRows
        >();

        for (const row of teamCapRows) {
          const existingRows =
            contractGroups.get(row.contract_id) ?? [];

          existingRows.push(row);
          contractGroups.set(
            row.contract_id,
            existingRows
          );
        }

        const players: TeamCapPlayerDTO[] =
          Array.from(contractGroups.entries())
            .map(([contractId, rows]) => {
              const firstRow = rows[0];

              if (!firstRow) {
                return null;
              }

              const contract = Array.isArray(
                firstRow.contracts
              )
                ? firstRow.contracts[0]
                : firstRow.contracts;

              if (!contract) {
                return null;
              }

              const leaguePlayer = Array.isArray(
                contract.league_players
              )
                ? contract.league_players[0]
                : contract.league_players;

              const playerRelation =
                leaguePlayer?.players;

              const player = Array.isArray(
                playerRelation
              )
                ? playerRelation[0]
                : playerRelation;

              const endSeasonRelation =
                contract.end_season;

              const endSeason = Array.isArray(
                endSeasonRelation
              )
                ? endSeasonRelation[0]
                : endSeasonRelation;

              const playerFutureCommitments =
                orderedSeasons.map((season) => {
                  const committed = roundCurrency(
                    rows
                      .filter(
                        (row) =>
                          row.season_id === season.id
                      )
                      .reduce(
                        (total, row) =>
                          total +
                          Number(row.salary ?? 0) +
                          Number(row.bonus ?? 0),
                        0
                      )
                  );

                  return {
                    seasonId: season.id,
                    seasonName: season.name,
                    seasonYear: season.year,
                    committed,
                    capSpace: roundCurrency(
                      settings.salaryCap - committed
                    ),
                    usagePercentage:
                      calculateUsagePercentage(
                        committed,
                        settings.salaryCap
                      ),
                  };
                });

              const currentCapHit =
                playerFutureCommitments.find(
                  (season) =>
                    season.seasonId ===
                    activeSeason.id
                )?.committed ?? 0;

              const playerName =
                player?.display_name ??
                player?.full_name ??
                "Unknown Player";

              const playerDto: TeamCapPlayerDTO = {
                contractId,
                leaguePlayerId:
                  contract.league_player_id,
                playerId:
                  leaguePlayer?.player_id ?? "",
                playerName,
                position: player?.position ?? null,
                proTeam: player?.pro_team ?? null,
                currentCapHit,
                totalValue: Number(
                  contract.total_value ?? 0
                ),
                endSeasonName:
                  endSeason?.name ?? "Unknown Season",
                contractYears: rows.length,
                futureCommitments:
                  playerFutureCommitments,
              };

              largestContracts.push({
                contractId,
                playerName,
                position: playerDto.position,
                proTeam: playerDto.proTeam,
                teamId: team.id,
                teamName: team.name,
                currentCapHit,
                totalValue: playerDto.totalValue,
                contractYears: rows.length,
                endSeasonName:
                  playerDto.endSeasonName,
              });

              return playerDto;
            })
            .filter(
              (
                player
              ): player is TeamCapPlayerDTO =>
                player !== null
            )
            .sort(
              (a, b) =>
                b.currentCapHit - a.currentCapHit
            );

        const contractYearsUsed =
          teamCapRows.length;

        const playerCount = rosterRows.filter(
          (row) => row.team_id === team.id
        ).length;

        const capHealth = getCapHealth({
          currentCapSpace,
          futureCommitments:
            futureCommitments.filter(
              (season) =>
                season.seasonId !== activeSeason.id
            ),
        });

        return {
          teamId: team.id,
          teamName: team.name,

          salaryCap: settings.salaryCap,
          currentCommitted,
          currentCapSpace,
          currentUsagePercentage,

          contractYearsUsed,
          maximumContractYears:
            settings.maximumContractYearsPerTeam,

          playerCount,

          capHealth: capHealth.status,
          capHealthMessage: capHealth.message,

          futureCommitments,
          players,
        };
      }
    );

    return {
      salaryCap: settings.salaryCap,
      currentSeasonId: activeSeason.id,
      currentSeasonName: activeSeason.name,
      teams: teamDtos,

      largestContracts: largestContracts
        .sort(
          (a, b) =>
            b.currentCapHit - a.currentCapHit
        )
        .slice(0, 5),
    };
  },
};
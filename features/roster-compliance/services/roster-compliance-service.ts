import type {
  RosterComplianceDTO,
  TeamRosterComplianceDTO,
} from "@/features/roster-compliance/dto/roster-compliance-dto";

import { RosterComplianceRepository } from "@/features/roster-compliance/repositories/roster-compliance-repository";
import { SeasonService } from "@/features/seasons/services/season-service";

function roundCurrency(
  value: number,
): number {
  return (
    Math.round(
      (value + Number.EPSILON) *
        100,
    ) / 100
  );
}

export const RosterComplianceService = {
  async getCompliance(params: {
    leagueId: string;
  }): Promise<RosterComplianceDTO> {
    const [
      activeSeason,
      seasons,
      settings,
      teams,
    ] = await Promise.all([
      SeasonService.getActiveSeasonByLeague(
        params.leagueId,
      ),

      SeasonService.getLeagueSeasons(
        params.leagueId,
      ),

      RosterComplianceRepository.getSettings(
        params.leagueId,
      ),

      RosterComplianceRepository.getTeams(
        params.leagueId,
      ),
    ]);

    if (!activeSeason) {
      throw new Error(
        "This league does not have an active season.",
      );
    }

    const activeYear =
      Number(
        activeSeason.year,
      );

    const complianceSeason =
      seasons
        .filter(
          (season) =>
            Number(
              season.year,
            ) >
            activeYear,
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

    if (!complianceSeason) {
      throw new Error(
        "The incoming season could not be found.",
      );
    }

    const [
      contractRows,
      deadCapRows,
      rosterRows,
    ] = await Promise.all([
      RosterComplianceRepository.getContractCommitments(
        {
          leagueId:
            params.leagueId,

          seasonId:
            complianceSeason.id,
        },
      ),

      RosterComplianceRepository.getDeadCap(
        {
          leagueId:
            params.leagueId,

          seasonId:
            complianceSeason.id,
        },
      ),

      RosterComplianceRepository.getRosterRows(
        {
          leagueId:
            params.leagueId,

          seasonId:
            complianceSeason.id,
        },
      ),
    ]);

    const salaryCap =
      Number(
        settings.salary_cap,
      );

    const maximumRosterSize =
      Number(
        settings.maximum_roster_size,
      );

    const teamDtos: TeamRosterComplianceDTO[] =
      teams.map(
        (team) => {
          const activeContracts =
            contractRows.filter(
              (row) => {
                const contract =
                  Array.isArray(
                    row.contracts,
                  )
                    ? row.contracts[0]
                    : row.contracts;

                return (
                  contract?.team_id ===
                  team.id
                );
              },
            );

          const contractCommitment =
            activeContracts.reduce(
              (total, row) =>
                total +
                Number(
                  row.salary ??
                    0,
                ) +
                Number(
                  row.bonus ??
                    0,
                ),
              0,
            );

          const deadCap =
            deadCapRows
              .filter(
                (row) =>
                  row.team_id ===
                  team.id,
              )
              .reduce(
                (total, row) =>
                  total +
                  Number(
                    row.amount ??
                      0,
                  ),
                0,
              );

          const committed =
            roundCurrency(
              contractCommitment +
                deadCap,
            );

          const capSpace =
            roundCurrency(
              salaryCap -
                committed,
            );

          const rosterCount =
            rosterRows.filter(
              (row) =>
                row.team_id ===
                team.id,
            ).length;

          const overCap =
            committed >
            salaryCap;

          const overRoster =
            rosterCount >
            maximumRosterSize;

          return {
            teamId:
              team.id,

            teamName:
              team.name,

            salaryCap,

            committed,

            capSpace,

            rosterCount,

            maximumRosterSize,

            overCap,

            overRoster,

            compliant:
              !overCap &&
              !overRoster,
          };
        },
      );

    const compliantTeams =
      teamDtos.filter(
        (team) =>
          team.compliant,
      ).length;

    return {
      leagueId:
        params.leagueId,

      seasonId:
        complianceSeason.id,

      seasonName:
        complianceSeason.name,

      seasonYear:
        Number(
          complianceSeason.year,
        ),

      salaryCap,

      maximumRosterSize,

      totalTeams:
        teamDtos.length,

      compliantTeams,

      nonCompliantTeams:
        teamDtos.length -
        compliantTeams,

      allCompliant:
        compliantTeams ===
        teamDtos.length,

      teams:
        teamDtos,
    };
  },
};
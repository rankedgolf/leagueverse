import type {
  SleeperImportTeamValidationDTO,
  SleeperImportValidationDTO,
  SleeperImportValidationIssue,
} from "@/features/integrations/dto/sleeper-import-validation-dto";
import { ImportSessionRepository } from "@/features/integrations/repositories/import-session-repository";
import { ContractSettingsService } from "@/features/contracts/services/contract-settings-service";

type ValidateSleeperImportInput = {
  leagueId: string;
  sessionId: string;
};

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export const SleeperImportValidationService = {
  async validate({
    leagueId,
    sessionId,
  }: ValidateSleeperImportInput): Promise<SleeperImportValidationDTO> {
    const [session, settings] = await Promise.all([
      ImportSessionRepository.getById({
        leagueId,
        sessionId,
      }),
      ContractSettingsService.getByLeague(leagueId),
    ]);

    if (!session) {
      throw new Error(
        "The Sleeper import session could not be found.",
      );
    }

    if (!session.previewData) {
      throw new Error(
        "The Sleeper import session does not contain preview data.",
      );
    }

    if (
      session.status === "completed" ||
      session.status === "cancelled"
    ) {
      throw new Error(
        "This import session can no longer be validated.",
      );
    }

    const preview = session.previewData;
    const assignments =
      session.contractYearAssignments;

    const issues: SleeperImportValidationIssue[] = [];

    const seenPlayerIds = new Set<string>();
    const duplicatePlayerIds = new Set<string>();

    for (const player of preview.players) {
      if (seenPlayerIds.has(player.sleeperPlayerId)) {
        duplicatePlayerIds.add(
          player.sleeperPlayerId,
        );
      }

      seenPlayerIds.add(player.sleeperPlayerId);
    }

    for (const player of preview.players) {
      const contractYears =
        assignments[player.sleeperPlayerId];

      if (duplicatePlayerIds.has(player.sleeperPlayerId)) {
        issues.push({
          code: "duplicate_player",
          severity: "error",
          sleeperPlayerId: player.sleeperPlayerId,
          sleeperRosterId: player.sleeperRosterId,
          message: `${player.playerName} appears more than once in the import.`,
        });
      }

      if (
        contractYears === undefined ||
        !Number.isInteger(contractYears) ||
        contractYears < 1
      ) {
        issues.push({
          code: "invalid_contract_years",
          severity: "error",
          sleeperPlayerId: player.sleeperPlayerId,
          sleeperRosterId: player.sleeperRosterId,
          message: `${player.playerName} does not have a valid contract length.`,
        });
      } else if (
        contractYears >
        settings.maximumContractLength
      ) {
        issues.push({
          code: "contract_too_long",
          severity: "error",
          sleeperPlayerId: player.sleeperPlayerId,
          sleeperRosterId: player.sleeperRosterId,
          message: `${player.playerName} exceeds the ${settings.maximumContractLength}-year maximum contract length.`,
        });
      }

      if (!Number.isFinite(player.auctionSalary)) {
        issues.push({
          code: "invalid_salary",
          severity: "error",
          sleeperPlayerId: player.sleeperPlayerId,
          sleeperRosterId: player.sleeperRosterId,
          message: `${player.playerName} does not have a valid auction salary.`,
        });
      } else if (
        player.auctionSalary <
        settings.minimumSalary
      ) {
        issues.push({
          code: "salary_below_minimum",
          severity: "error",
          sleeperPlayerId: player.sleeperPlayerId,
          sleeperRosterId: player.sleeperRosterId,
          message: `${player.playerName}'s salary is below the league minimum of ${settings.minimumSalary}.`,
        });
      }

      for (const playerError of player.errors) {
        issues.push({
          code: "preview_error",
          severity: "error",
          sleeperPlayerId: player.sleeperPlayerId,
          sleeperRosterId: player.sleeperRosterId,
          message: `${player.playerName}: ${playerError}`,
        });
      }

      for (const warning of player.warnings) {
        issues.push({
          code: "preview_warning",
          severity: "warning",
          sleeperPlayerId: player.sleeperPlayerId,
          sleeperRosterId: player.sleeperRosterId,
          message: `${player.playerName}: ${warning}`,
        });
      }
    }

    const teams: SleeperImportTeamValidationDTO[] =
      preview.teams.map((team) => {
        const teamPlayers = preview.players.filter(
          (player) =>
            player.sleeperRosterId ===
            team.sleeperRosterId,
        );

        const yearOneSalary = roundCurrency(
          teamPlayers.reduce(
            (total, player) =>
              total + player.auctionSalary,
            0,
          ),
        );

        const contractYearsUsed =
          teamPlayers.reduce(
            (total, player) =>
              total +
              (assignments[
                player.sleeperPlayerId
              ] ?? 0),
            0,
          );

        const capSpace = roundCurrency(
          settings.salaryCap - yearOneSalary,
        );

        const isOverSalaryCap = capSpace < 0;

        const exceedsContractYears =
          contractYearsUsed >
          settings.maximumContractYearsPerTeam;

        if (isOverSalaryCap) {
          issues.push({
            code: "team_over_salary_cap",
            severity: "error",
            sleeperRosterId: team.sleeperRosterId,
            message: `${team.teamName} is ${Math.abs(
              capSpace,
            ).toFixed(2)} over the salary cap.`,
          });
        }

        if (exceedsContractYears) {
          issues.push({
            code: "team_over_contract_years",
            severity: "error",
            sleeperRosterId: team.sleeperRosterId,
            message: `${team.teamName} exceeds the team contract-year limit by ${
              contractYearsUsed -
              settings.maximumContractYearsPerTeam
            } years.`,
          });
        }

        if (!team.sleeperOwnerId) {
          issues.push({
            code: "missing_team_owner",
            severity: "warning",
            sleeperRosterId: team.sleeperRosterId,
            message: `${team.teamName} does not have a Sleeper owner assigned.`,
          });
        }

        const teamIssues = issues.filter(
          (issue) =>
            issue.sleeperRosterId ===
            team.sleeperRosterId,
        );

        const errorCount = teamIssues.filter(
          (issue) => issue.severity === "error",
        ).length;

        const warningCount = teamIssues.filter(
          (issue) =>
            issue.severity === "warning",
        ).length;

        return {
          sleeperRosterId:
            team.sleeperRosterId,
          teamName: team.teamName,
          playerCount: teamPlayers.length,

          yearOneSalary,
          salaryCap: settings.salaryCap,
          capSpace,
          isOverSalaryCap,

          contractYearsUsed,
          maximumContractYears:
            settings.maximumContractYearsPerTeam,
          contractYearsAvailable: Math.max(
            settings.maximumContractYearsPerTeam -
              contractYearsUsed,
            0,
          ),
          exceedsContractYears,

          errorCount,
          warningCount,
          isValid: errorCount === 0,
        };
      });

    const errorCount = issues.filter(
      (issue) => issue.severity === "error",
    ).length;

    const warningCount = issues.filter(
      (issue) => issue.severity === "warning",
    ).length;

    const invalidPlayerIds = new Set(
      issues
        .filter(
          (issue) =>
            issue.severity === "error" &&
            issue.sleeperPlayerId,
        )
        .map(
          (issue) =>
            issue.sleeperPlayerId as string,
        ),
    );

    return {
      sessionId: session.id,
      leagueId,

      teamCount: teams.length,
      playerCount: preview.players.length,

      salaryCap: settings.salaryCap,
      maximumContractLength:
        settings.maximumContractLength,
      maximumContractYearsPerTeam:
        settings.maximumContractYearsPerTeam,

      validTeamCount: teams.filter(
        (team) => team.isValid,
      ).length,
      invalidTeamCount: teams.filter(
        (team) => !team.isValid,
      ).length,

      validPlayerCount:
        preview.players.length -
        invalidPlayerIds.size,
      invalidPlayerCount:
        invalidPlayerIds.size,

      errorCount,
      warningCount,
      isValid: errorCount === 0,

      teams,
      issues,
    };
  },
};
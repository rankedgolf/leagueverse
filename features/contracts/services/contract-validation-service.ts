import { ContractRepository } from "@/features/contracts/repositories/contract-repository";
import { ContractSettingsService } from "@/features/contracts/services/contract-settings-service";

export type ValidateContractInput = {
  leagueId: string;
  teamId: string;
  leaguePlayerId: string;
  startingSalary: number;
  lengthYears: number;
};

export type ContractValidationResult = {
  isValid: boolean;
  errors: string[];
  currentTeamContractYears: number;
  projectedTeamContractYears: number;
};

export const ContractValidationService = {
  async validate(
    input: ValidateContractInput
  ): Promise<ContractValidationResult> {
    const errors: string[] = [];

    const settings = await ContractSettingsService.getByLeague(
      input.leagueId
    );

    if (
      !Number.isFinite(input.startingSalary) ||
      input.startingSalary < settings.minimumSalary
    ) {
      errors.push(
        `Starting salary must be at least ${settings.minimumSalary}.`
      );
    }

    if (!Number.isInteger(input.lengthYears) || input.lengthYears < 1) {
      errors.push("Contract length must be at least one year.");
    }

    if (input.lengthYears > settings.maximumContractLength) {
      errors.push(
        `Contract length cannot exceed ${settings.maximumContractLength} years.`
      );
    }

    const [existingContract, currentTeamContractYears] =
      await Promise.all([
        ContractRepository.getActiveContractByLeaguePlayer(
          input.leagueId,
          input.leaguePlayerId
        ),
        ContractRepository.getActiveContractYearCountByTeam(
          input.leagueId,
          input.teamId
        ),
      ]);

    if (existingContract) {
      errors.push("This player already has an active contract.");
    }

    const projectedTeamContractYears =
      currentTeamContractYears + input.lengthYears;

    if (
      projectedTeamContractYears >
      settings.maximumContractYearsPerTeam
    ) {
      errors.push(
        `This contract would exceed the team's maximum of ${settings.maximumContractYearsPerTeam} committed contract years.`
      );
    }

    return {
      isValid: errors.length === 0,
      errors,
      currentTeamContractYears,
      projectedTeamContractYears,
    };
  },

  async requireValid(input: ValidateContractInput): Promise<void> {
    const result = await this.validate(input);

    if (!result.isValid) {
      throw new Error(result.errors.join(" "));
    }
  },
};
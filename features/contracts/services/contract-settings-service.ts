import type { ContractSettingsDTO } from "@/features/contracts/dto/contract-settings-dto";
import { ContractSettingsRepository } from "@/features/contracts/repositories/contract-settings-repository";

export const ContractSettingsService = {
  async getByLeague(leagueId: string): Promise<ContractSettingsDTO> {
    const settings = await ContractSettingsRepository.getByLeague(leagueId);

    if (!settings) {
      throw new Error(
        "Contract settings have not been configured for this league."
      );
    }

    return {
      id: settings.id,
      leagueId: settings.league_id,
      salaryCap: Number(settings.salary_cap),
      minimumSalary: Number(settings.minimum_salary),
      maximumContractLength: Number(settings.maximum_contract_length),
      maximumContractYearsPerTeam: Number(
        settings.maximum_contract_years_per_team
      ),
      annualInflationRate: Number(settings.annual_inflation_rate),
      freeAgencyMode: settings.free_agency_mode,
      playerPersonalityModeEnabled:
        settings.player_personality_mode_enabled,
    };
  },
};
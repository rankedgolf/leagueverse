import { createClient } from "@/lib/supabase/server";
import { ContractCalculationService } from "@/features/contracts/services/contract-calculation-service";
import { ContractSettingsService } from "@/features/contracts/services/contract-settings-service";
import { ContractValidationService } from "@/features/contracts/services/contract-validation-service";
import { SeasonService } from "@/features/seasons/services/season-service";

export type GenerateContractInput = {
  leagueId: string;
  teamId: string;
  leaguePlayerId: string;
  startSeasonId: string;
  startingSalary: number;
  lengthYears: number;
  contractType?: string;
  source?: string;
  guaranteedValue?: number;
  bonusPerYear?: number;
  notes?: string | null;
};

export type GeneratedContractResult = {
  contractId: string;
  totalValue: number;
  contractYearCount: number;
};

export const ContractGenerationService = {
  async generate(
    input: GenerateContractInput
  ): Promise<GeneratedContractResult> {
    await ContractValidationService.requireValid({
      leagueId: input.leagueId,
      teamId: input.teamId,
      leaguePlayerId: input.leaguePlayerId,
      startingSalary: input.startingSalary,
      lengthYears: input.lengthYears,
    });

    const settings = await ContractSettingsService.getByLeague(
      input.leagueId
    );

    const contractSeasons = await SeasonService.getContractSeasons({
      leagueId: input.leagueId,
      startSeasonId: input.startSeasonId,
      lengthYears: input.lengthYears,
    });

    const schedule = ContractCalculationService.calculateSchedule({
      startingSalary: input.startingSalary,
      lengthYears: input.lengthYears,
      annualInflationRate: settings.annualInflationRate,
      bonusPerYear: input.bonusPerYear ?? 0,
    });

    const startSeason = contractSeasons[0];
    const endSeason = contractSeasons[contractSeasons.length - 1];

    if (!startSeason || !endSeason) {
      throw new Error("Contract seasons could not be determined.");
    }

    const guaranteedValue = input.guaranteedValue ?? 0;

    if (
      !Number.isFinite(guaranteedValue) ||
      guaranteedValue < 0 ||
      guaranteedValue > schedule.totalValue
    ) {
      throw new Error(
        "Guaranteed value must be between zero and the total contract value."
      );
    }

    const contractYears = schedule.years.map((year, index) => {
      const season = contractSeasons[index];

      if (!season) {
        throw new Error(
          `Season mapping is missing for contract year ${year.yearNumber}.`
        );
      }

      return {
        season_id: season.id,
        salary: year.salary,
        bonus: year.bonus,
        guaranteed_amount: year.guaranteedAmount,
        is_option_year: false,
        option_type: null,
      };
    });

    const supabase = await createClient();

    const { data: contractId, error } = await supabase.rpc(
      "create_contract_with_years",
      {
        p_league_id: input.leagueId,
        p_team_id: input.teamId,
        p_league_player_id: input.leaguePlayerId,
        p_contract_type: input.contractType ?? "standard",
        p_status: "active",
        p_signed_at: new Date().toISOString().slice(0, 10),
        p_starts_season_id: startSeason.id,
        p_ends_season_id: endSeason.id,
        p_total_value: schedule.totalValue,
        p_guaranteed_value: guaranteedValue,
        p_notes: input.notes ?? null,
        p_contract_years: contractYears,
      }
    );

    if (error) {
      throw new Error(error.message);
    }

    if (!contractId) {
      throw new Error("Contract creation did not return a contract ID.");
    }

    return {
      contractId,
      totalValue: schedule.totalValue,
      contractYearCount: contractYears.length,
    };
  },
};
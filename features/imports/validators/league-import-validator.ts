import type { LeagueImportRow } from "@/features/imports/parsers/league-import-parser";

export type LeagueImportRowValidation = {
  row: LeagueImportRow;
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

type ValidateLeagueImportRowsInput = {
  rows: LeagueImportRow[];
  minimumSalary: number;
  maximumContractLength: number;
};

export function validateLeagueImportRows({
  rows,
  minimumSalary,
  maximumContractLength,
}: ValidateLeagueImportRowsInput): LeagueImportRowValidation[] {
  return rows.map((row) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!row.fantasyTeam) {
      errors.push("Fantasy team is required.");
    }

    if (!row.playerName) {
      errors.push("Player name is required.");
    }

    if (!row.position) {
      warnings.push("Position is missing.");
    }

    if (!row.proTeam) {
      warnings.push("Professional team is missing.");
    }

    if (!row.sport) {
      errors.push("Sport is required.");
    }

    if (
      !Number.isFinite(row.startingSalary) ||
      row.startingSalary < minimumSalary
    ) {
      errors.push(
        `Starting salary must be at least ${minimumSalary}.`
      );
    }

    if (
      !Number.isInteger(row.contractYears) ||
      row.contractYears < 1
    ) {
      errors.push(
        "Contract years must be a positive whole number."
      );
    } else if (
      row.contractYears > maximumContractLength
    ) {
      errors.push(
        `Contract length cannot exceed ${maximumContractLength} years.`
      );
    }

    return {
      row,
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  });
}
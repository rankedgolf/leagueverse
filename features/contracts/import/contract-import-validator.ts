import type { ContractImportRow } from "./contract-import-parser";

export type ContractImportRowValidation = {
  row: ContractImportRow;
  isValid: boolean;
  errors: string[];
};

export type ValidateContractImportRowsInput = {
  rows: ContractImportRow[];
  minimumSalary: number;
  maximumContractLength: number;
};

export function validateContractImportRows({
  rows,
  minimumSalary,
  maximumContractLength,
}: ValidateContractImportRowsInput): ContractImportRowValidation[] {
  return rows.map((row) => {
    const errors: string[] = [];

    if (!row.fantasyTeam) {
      errors.push("Fantasy team is required.");
    }

    if (!row.playerName) {
      errors.push("Player name is required.");
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
      errors.push("Contract years must be a positive whole number.");
    } else if (row.contractYears > maximumContractLength) {
      errors.push(
        `Contract length cannot exceed ${maximumContractLength} years.`
      );
    }

    return {
      row,
      isValid: errors.length === 0,
      errors,
    };
  });
}
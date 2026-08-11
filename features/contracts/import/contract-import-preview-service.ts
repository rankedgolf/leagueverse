import type { ContractImportRow } from "./contract-import-parser";
import {
  validateContractImportRows,
  type ContractImportRowValidation,
} from "./contract-import-validator";
import {
  resolveContractImportRows,
  type ResolvedContractImportRow,
} from "./contract-import-resolver";
import { ContractSettingsService } from "@/features/contracts/services/contract-settings-service";
import { ContractCalculationService } from "@/features/contracts/services/contract-calculation-service";

export type ContractImportPreviewYear = {
  yearNumber: number;
  salary: number;
  capHit: number;
};

export type ContractImportPreviewRow = ResolvedContractImportRow & {
  schedule: ContractImportPreviewYear[];
  totalValue: number;
};

export type ContractImportPreview = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  rows: ContractImportPreviewRow[];
};

type BuildContractImportPreviewInput = {
  leagueId: string;
  rows: ContractImportRow[];
};

export const ContractImportPreviewService = {
  async build({
    leagueId,
    rows,
  }: BuildContractImportPreviewInput): Promise<ContractImportPreview> {
    const settings = await ContractSettingsService.getByLeague(leagueId);

    const validations: ContractImportRowValidation[] =
      validateContractImportRows({
        rows,
        minimumSalary: settings.minimumSalary,
        maximumContractLength: settings.maximumContractLength,
      });

    const resolvedRows = await resolveContractImportRows({
      leagueId,
      validations,
    });

    const previewRows: ContractImportPreviewRow[] = resolvedRows.map(
      (resolvedRow) => {
        if (!resolvedRow.isValid) {
          return {
            ...resolvedRow,
            schedule: [],
            totalValue: 0,
          };
        }

        const schedule =
          ContractCalculationService.calculateSchedule({
            startingSalary: resolvedRow.row.startingSalary,
            lengthYears: resolvedRow.row.contractYears,
            annualInflationRate: settings.annualInflationRate,
          });

        return {
          ...resolvedRow,
          schedule: schedule.years.map((year) => ({
            yearNumber: year.yearNumber,
            salary: year.salary,
            capHit: year.capHit,
          })),
          totalValue: schedule.totalValue,
        };
      }
    );

    const validRows = previewRows.filter((row) => row.isValid).length;

    return {
      totalRows: previewRows.length,
      validRows,
      invalidRows: previewRows.length - validRows,
      rows: previewRows,
    };
  },
};
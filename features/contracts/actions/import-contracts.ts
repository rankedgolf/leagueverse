"use server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import { ContractGenerationService } from "@/features/contracts/services/contract-generation-service";
import type { ContractImportPreview } from "@/features/contracts/import/contract-import-preview-service";
import { SeasonService } from "@/features/seasons/services/season-service";

export type ContractImportResult = {
  created: number;
  failed: number;
  errors: string[];
};

export async function importContracts(
  leagueId: string,
  preview: ContractImportPreview
): Promise<ContractImportResult> {
  await AuthorizationService.requirePermission({
    leagueId,
    permission: Permissions.ManageContracts,
  });

  const activeSeason =
    await SeasonService.getActiveSeasonByLeague(leagueId);

  if (!activeSeason) {
    throw new Error("No active season exists.");
  }

  let created = 0;

  const errors: string[] = [];

  for (const row of preview.rows) {
    if (!row.isValid) continue;

    try {
      await ContractGenerationService.generate({
        leagueId,
        teamId: row.teamId!,
        leaguePlayerId: row.leaguePlayerId!,
        startSeasonId: activeSeason.id,
        startingSalary: row.row.startingSalary,
        lengthYears: row.row.contractYears,
        contractType: "standard",
        source: "spreadsheet_import",
      });

      created++;
    } catch (error) {
      errors.push(
        `${row.playerName}: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    }
  }

  return {
    created,
    failed: errors.length,
    errors,
  };
}
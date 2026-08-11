"use server";

import { revalidatePath } from "next/cache";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import { LeagueImportService } from "@/features/imports/services/league-import-service";
import type { LeagueImportPreview } from "@/features/imports/services/league-import-preview-service";
import { SeasonService } from "@/features/seasons/services/season-service";

export type LeagueImportExecutionResult = {
  imported: number;
  failed: number;

  createdPlayers: number;
  createdLeaguePlayers: number;
  createdRosterEntries: number;
  createdContracts: number;

  errors: string[];
};

type ImportLeagueInput = {
  leagueId: string;
  preview: LeagueImportPreview;
};

export async function importLeague(
  input: ImportLeagueInput
): Promise<LeagueImportExecutionResult> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManagePlayers,
  });

  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageContracts,
  });

  const activeSeason =
    await SeasonService.getActiveSeasonByLeague(input.leagueId);

  if (!activeSeason) {
    throw new Error(
      "This league does not have an active season."
    );
  }

  if (input.preview.rows.length === 0) {
    throw new Error(
      "There are no league import rows to process."
    );
  }

  if (input.preview.rows.length > 1000) {
    throw new Error(
      "League imports are limited to 1,000 rows at a time."
    );
  }

  let imported = 0;
  let createdPlayers = 0;
  let createdLeaguePlayers = 0;
  let createdRosterEntries = 0;
  let createdContracts = 0;

  const errors: string[] = [];

  for (const previewRow of input.preview.rows) {
    if (!previewRow.isValid) {
      continue;
    }

    if (!previewRow.teamId) {
      errors.push(
        `Row ${previewRow.row.rowNumber}: Fantasy team could not be resolved.`
      );

      continue;
    }

    try {
      const result = await LeagueImportService.importPlayer({
        leagueId: input.leagueId,
        seasonId: activeSeason.id,

        fantasyTeamId: previewRow.teamId,

        playerName: previewRow.row.playerName,
        firstName: previewRow.row.firstName,
        lastName: previewRow.row.lastName,
        position: previewRow.row.position,
        proTeam: previewRow.row.proTeam,
        sport: previewRow.row.sport,

        startingSalary: previewRow.row.startingSalary,
        contractYears: previewRow.row.contractYears,

        externalPlayerId:
          previewRow.row.externalPlayerId,

        source: "spreadsheet",
      });

      imported += 1;
      createdContracts += 1;

      if (result.createdPlayer) {
        createdPlayers += 1;
      }

      if (result.createdLeaguePlayer) {
        createdLeaguePlayers += 1;
      }

      if (result.createdRosterEntry) {
        createdRosterEntries += 1;
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown import error.";

      errors.push(
        `Row ${previewRow.row.rowNumber} — ${previewRow.row.playerName}: ${message}`
      );
    }
  }

  revalidatePath(`/leagues/${input.leagueId}`);
  revalidatePath(`/leagues/${input.leagueId}/players`);
  revalidatePath(`/leagues/${input.leagueId}/rosters`);
  revalidatePath(`/leagues/${input.leagueId}/contracts`);
  revalidatePath(`/leagues/${input.leagueId}/salary-cap`);

  return {
    imported,
    failed: errors.length,

    createdPlayers,
    createdLeaguePlayers,
    createdRosterEntries,
    createdContracts,

    errors,
  };
}
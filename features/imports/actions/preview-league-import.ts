"use server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import type { LeagueImportRow } from "@/features/imports/parsers/league-import-parser";
import {
  LeagueImportPreviewService,
  type LeagueImportPreview,
} from "@/features/imports/services/league-import-preview-service";

type PreviewLeagueImportInput = {
  leagueId: string;
  rows: LeagueImportRow[];
};

export async function previewLeagueImport(
  input: PreviewLeagueImportInput
): Promise<LeagueImportPreview> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManagePlayers,
  });

  if (input.rows.length === 0) {
    throw new Error(
      "The import file does not contain any player rows."
    );
  }

  if (input.rows.length > 1000) {
    throw new Error(
      "League imports are currently limited to 1,000 rows at a time."
    );
  }

  return LeagueImportPreviewService.build({
    leagueId: input.leagueId,
    rows: input.rows,
  });
}
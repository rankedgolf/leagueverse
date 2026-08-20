"use server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

import type { RookieDraftImportRow } from "@/features/rookie-draft/import/rookie-draft-import-parser";

import { RookieDraftImportPreviewService } from "@/features/rookie-draft/import/rookie-draft-import-preview-service";

export async function previewRookieDraftImport(
  input: {
    leagueId: string;
    rows: RookieDraftImportRow[];
  },
) {
  await AuthorizationService.requirePermission({
    leagueId:
      input.leagueId,

    permission:
      Permissions.ManageLeague,
  });

  return RookieDraftImportPreviewService.build({
    leagueId:
      input.leagueId,

    rows:
      input.rows,
  });
}
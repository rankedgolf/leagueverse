"use server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import type { SleeperSyncPreviewDTO } from "@/features/integrations/dto/sleeper-sync-preview-dto";
import { SleeperSyncPreviewService } from "@/features/integrations/services/sleeper-sync-preview-service";

type PreviewSleeperSyncInput = {
  leagueId: string;
};

export async function previewSleeperSync(
  input: PreviewSleeperSyncInput,
): Promise<SleeperSyncPreviewDTO> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  return SleeperSyncPreviewService.build({
    leagueId: input.leagueId,
  });
}
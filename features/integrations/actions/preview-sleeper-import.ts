"use server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import type { SleeperImportPreviewDTO } from "@/features/integrations/dto/sleeper-import-preview-dto";
import { IntegrationService } from "@/features/integrations/services/integration-service";

type PreviewSleeperImportInput = {
  leagueId: string;
  defaultContractYears?: number;
};

export async function previewSleeperImport(
  input: PreviewSleeperImportInput
): Promise<SleeperImportPreviewDTO> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  const integration =
    await IntegrationService.getLeagueIntegration(
      input.leagueId,
      "sleeper"
    );

  if (!integration) {
    throw new Error(
      "This league is not connected to Sleeper."
    );
  }

  if (!integration.isConnected) {
    throw new Error(
      "The Sleeper integration is currently disconnected."
    );
  }

  return IntegrationService.previewSleeperImport({
    externalLeagueId:
      integration.externalLeagueId,
    externalDraftId:
      integration.externalDraftId,
    defaultContractYears:
      input.defaultContractYears ?? 1,
  });
}
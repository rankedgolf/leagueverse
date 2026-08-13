"use server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

import { ReleasePreviewService } from "@/features/releases/services/release-preview-service";

export async function getReleasePreview(params: {
  leagueId: string;
  contractId: string;
}) {
  await AuthorizationService.requirePermission({
    leagueId: params.leagueId,
    permission: Permissions.ManageRosters,
  });

  return ReleasePreviewService.getPreview({
    leagueId: params.leagueId,
    contractId: params.contractId,
  });
}
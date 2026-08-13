"use server";

import { FranchiseTagPreviewService } from "@/features/franchise-tags/services/franchise-tag-preview-service";

export async function getFranchiseTagPreview(params: {
  leagueId: string;
  contractId: string;
}) {
  return FranchiseTagPreviewService.getPreview({
    leagueId: params.leagueId,
    contractId: params.contractId,
  });
}
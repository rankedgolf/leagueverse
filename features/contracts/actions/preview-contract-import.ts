"use server";

import type { ContractImportRow } from "@/features/contracts/import/contract-import-parser";
import type { ContractImportPreview } from "@/features/contracts/import/contract-import-preview-service";
import { ContractImportPreviewService } from "@/features/contracts/import/contract-import-preview-service";
import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

type PreviewContractImportInput = {
  leagueId: string;
  rows: ContractImportRow[];
};

export async function previewContractImport(
  input: PreviewContractImportInput
): Promise<ContractImportPreview> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageContracts,
  });

  if (!input.rows.length) {
    throw new Error("The import file does not contain any contract rows.");
  }

  if (input.rows.length > 1000) {
    throw new Error(
      "Contract imports are currently limited to 1,000 rows at a time."
    );
  }

  return ContractImportPreviewService.build({
    leagueId: input.leagueId,
    rows: input.rows,
  });
}
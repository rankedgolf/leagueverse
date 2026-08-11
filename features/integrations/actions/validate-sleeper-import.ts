"use server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import type { SleeperImportValidationDTO } from "@/features/integrations/dto/sleeper-import-validation-dto";
import { SleeperImportValidationService } from "@/features/integrations/services/sleeper-import-validation-service";
import { ImportSessionRepository } from "@/features/integrations/repositories/import-session-repository";

type ValidateSleeperImportInput = {
  leagueId: string;
  sessionId: string;
};

export async function validateSleeperImport(
  input: ValidateSleeperImportInput,
): Promise<SleeperImportValidationDTO> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  const validation =
    await SleeperImportValidationService.validate({
      leagueId: input.leagueId,
      sessionId: input.sessionId,
    });

  await ImportSessionRepository.update({
    leagueId: input.leagueId,
    sessionId: input.sessionId,
    currentStep: 3,
    status: validation.isValid
      ? "ready"
      : "draft",
  });

  return validation;
}
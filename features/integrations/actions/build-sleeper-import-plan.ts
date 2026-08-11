"use server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import type { SleeperImportPlanDTO } from "@/features/integrations/dto/sleeper-import-plan-dto";
import { SleeperImportPlanService } from "@/features/integrations/services/sleeper-import-plan-service";

type BuildSleeperImportPlanInput = {
  leagueId: string;
  sessionId: string;
};

export async function buildSleeperImportPlan(
  input: BuildSleeperImportPlanInput,
): Promise<SleeperImportPlanDTO> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  return SleeperImportPlanService.build({
    leagueId: input.leagueId,
    sessionId: input.sessionId,
  });
}
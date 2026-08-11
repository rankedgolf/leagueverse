"use server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import type {
  ContractYearAssignments,
  ImportSessionDTO,
} from "@/features/integrations/repositories/import-session-repository";
import { ImportSessionService } from "@/features/integrations/services/import-session-service";

type SaveSleeperContractAssignmentsInput = {
  leagueId: string;
  sessionId: string;
  assignments: ContractYearAssignments;
  currentStep?: number;
};

export async function saveSleeperContractAssignments(
  input: SaveSleeperContractAssignmentsInput
): Promise<ImportSessionDTO> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  return ImportSessionService.updateContractAssignments(
    {
      leagueId: input.leagueId,
      sessionId: input.sessionId,
      assignments: input.assignments,
      currentStep: input.currentStep,
    }
  );
}
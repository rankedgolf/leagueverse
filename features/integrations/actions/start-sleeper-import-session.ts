"use server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import type { ImportSessionDTO } from "@/features/integrations/repositories/import-session-repository";
import { ImportSessionService } from "@/features/integrations/services/import-session-service";

type StartSleeperImportSessionInput = {
  leagueId: string;
};

export async function startSleeperImportSession(
  input: StartSleeperImportSessionInput
): Promise<ImportSessionDTO> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  return ImportSessionService.startOrResumeSleeperSession(
    {
      leagueId: input.leagueId,
    }
  );
}
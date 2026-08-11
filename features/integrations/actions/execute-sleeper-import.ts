"use server";

import { revalidatePath } from "next/cache";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import type { SleeperImportExecutionResultDTO } from "@/features/integrations/dto/sleeper-import-execution-dto";
import { SleeperImportExecutionService } from "@/features/integrations/services/sleeper-import-execution-service";

type ExecuteSleeperImportInput = {
  leagueId: string;
  sessionId: string;
};

export async function executeSleeperImport(
  input: ExecuteSleeperImportInput,
): Promise<SleeperImportExecutionResultDTO> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  const result =
    await SleeperImportExecutionService.execute({
      leagueId: input.leagueId,
      sessionId: input.sessionId,
    });

  revalidatePath(
    `/leagues/${input.leagueId}/players`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/rosters`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/contracts`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/salary-cap`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/integrations/sleeper/import`,
  );

  return result;
}
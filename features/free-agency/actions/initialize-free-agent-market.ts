"use server";

import { revalidatePath } from "next/cache";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

import { LeagueFreeAgentPoolService } from "@/features/free-agency/services/league-free-agent-pool-service";
import { FreeAgencyProfileService } from "@/features/free-agency/services/free-agency-profile-service";

import { SleeperMasterPlayerService } from "@/features/integrations/services/sleeper-master-player-service";

export async function initializeFreeAgentMarket(
  leagueId: string,
) {
  await AuthorizationService.requirePermission({
    leagueId,
    permission:
      Permissions.ManageLeague,
  });

  const masterPlayerSync =
    await SleeperMasterPlayerService.sync();

  const playerPool =
    await LeagueFreeAgentPoolService.initialize(
      leagueId,
    );

  const profiles =
    await FreeAgencyProfileService.generateMissingProfiles(
      leagueId,
    );

  revalidatePath(
    `/leagues/${leagueId}/free-agency`,
  );

  return {
    masterPlayerSync,
    playerPool,
    profiles,
  };
}
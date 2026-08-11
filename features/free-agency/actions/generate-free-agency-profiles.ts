"use server";

import { revalidatePath } from "next/cache";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import { FreeAgencyProfileService } from "@/features/free-agency/services/free-agency-profile-service";

export async function generateFreeAgencyProfiles(
  leagueId: string,
) {
  await AuthorizationService.requirePermission({
    leagueId,
    permission:
      Permissions.ManageLeague,
  });

  const result =
    await FreeAgencyProfileService.generateMissingProfiles(
      leagueId,
    );

  revalidatePath(
    `/leagues/${leagueId}/free-agency`,
  );

  return result;
}
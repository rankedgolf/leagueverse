"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import { FreeAgencyProfileService } from "@/features/free-agency/services/free-agency-profile-service";

export async function regenerateFreeAgencyProfiles(
  leagueId: string,
) {
  await AuthorizationService.requirePermission({
    leagueId,
    permission: Permissions.ManageLeague,
  });

  const supabase = await createClient();

  const { count, error } = await supabase
    .from("player_free_agency_profiles")
    .delete({
      count: "exact",
    })
    .eq("league_id", leagueId);

  if (error) {
    throw new Error(error.message);
  }

  const result =
    await FreeAgencyProfileService.generateMissingProfiles(
      leagueId,
    );

  revalidatePath(
    `/leagues/${leagueId}/free-agency`,
  );

  return {
    deletedCount: count ?? 0,
    generatedCount:
      result.generatedCount,
    freeAgentCount:
      result.freeAgentCount,
  };
}
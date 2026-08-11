"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

import { FreeAgencyProcessingService } from "@/features/free-agency/services/free-agency-processing-service";

export async function processFreeAgencyNow(
  input: {
    leagueId: string;
    periodId: string;
  },
) {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  const result =
    await FreeAgencyProcessingService.processDueDecisions({
      leagueId: input.leagueId,
      periodId: input.periodId,
      createdBy: user?.id ?? null,
      force: true,
    });

  revalidatePath(
    `/leagues/${input.leagueId}/free-agency`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/transactions`,
  );

  return result;
}
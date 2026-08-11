"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

import { FreeAgencyDecisionService } from "@/features/free-agency/services/free-agency-decision-service";

export async function runFreeAgencyDecision(
  input: {
    leagueId: string;
    leaguePlayerId: string;
  },
) {
  await AuthorizationService.requirePermission({
    leagueId:
      input.leagueId,

    permission:
      Permissions.ManageLeague,
  });

  const supabase =
    await createClient();

  const {
    data: { user },
  } =
    await supabase.auth.getUser();

  const result =
    await FreeAgencyDecisionService.runDecision(
      {
        leagueId:
          input.leagueId,

        leaguePlayerId:
          input.leaguePlayerId,

        createdBy:
          user?.id ?? null,
      },
    );

  revalidatePath(
    `/leagues/${input.leagueId}/free-agency`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/transactions`,
  );

  return result;
}
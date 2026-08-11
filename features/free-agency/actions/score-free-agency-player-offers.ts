"use server";

import { revalidatePath } from "next/cache";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

import { FreeAgencyOfferScoringService } from "@/features/free-agency/services/free-agency-offer-scoring-service";

export async function scoreFreeAgencyPlayerOffers(
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

  const result =
    await FreeAgencyOfferScoringService.scorePlayerOffers(
      {
        leagueId:
          input.leagueId,

        leaguePlayerId:
          input.leaguePlayerId,
      },
    );

  revalidatePath(
    `/leagues/${input.leagueId}/free-agency`,
  );

  return result;
}
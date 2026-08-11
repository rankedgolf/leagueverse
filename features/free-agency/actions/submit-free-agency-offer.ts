"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { FreeAgencyOfferService } from "@/features/free-agency/services/free-agency-offer-service";

type SubmitFreeAgencyOfferInput = {
  leagueId: string;
  leaguePlayerId: string;

  annualSalary: number;
  contractYears: number;

  guaranteedValue: number;
  signingBonus: number;
};

export async function submitFreeAgencyOffer(
  input:
    SubmitFreeAgencyOfferInput,
) {
  const supabase =
    await createClient();

  const {
    data: { user },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    throw new Error(
      "You must be signed in to submit a free-agent offer.",
    );
  }

  const result =
    await FreeAgencyOfferService.submitOffer(
      {
        leagueId:
          input.leagueId,

        leaguePlayerId:
          input.leaguePlayerId,

        userId:
          user.id,

        annualSalary:
          input.annualSalary,

        contractYears:
          input.contractYears,

        guaranteedValue:
          input.guaranteedValue,

        signingBonus:
          input.signingBonus,
      },
    );

  revalidatePath(
    `/leagues/${input.leagueId}/free-agency`,
  );

  return result;
}
"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { FreeAgencyOfferService } from "@/features/free-agency/services/free-agency-offer-service";

type UpdateFreeAgencyOfferInput = {
  leagueId: string;
  offerId: string;
  annualSalary: number;
  contractYears: number;
  guaranteedValue: number;
  signingBonus: number;
};

export async function updateFreeAgencyOffer(
  input: UpdateFreeAgencyOfferInput,
) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be signed in to edit a free-agent offer.",
    );
  }

  const result = await FreeAgencyOfferService.updateOffer({
    ...input,
    userId: user.id,
  });

  revalidatePath(`/leagues/${input.leagueId}/free-agency`);

  return result;
}
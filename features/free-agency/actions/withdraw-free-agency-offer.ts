"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { FreeAgencyOfferService } from "@/features/free-agency/services/free-agency-offer-service";

export async function withdrawFreeAgencyOffer(input: {
  leagueId: string;
  offerId: string;
}) {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be signed in to withdraw a free-agent offer.",
    );
  }

  const result = await FreeAgencyOfferService.withdrawOffer({
    leagueId: input.leagueId,
    offerId: input.offerId,
    userId: user.id,
  });

  revalidatePath(`/leagues/${input.leagueId}/free-agency`);

  return result;
}
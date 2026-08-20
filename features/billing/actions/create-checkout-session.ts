"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";
import {
  getStripe,
  STRIPE_PRICE_ID,
} from "@/lib/stripe/server";

const stripe =
  getStripe();

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

type CreateCheckoutSessionInput = {
  leagueId: string;
};

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
) {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  const supabase =
    await createClient();

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();

  if (
    userError ||
    !user
  ) {
    throw new Error(
      "You must be signed in to activate a league.",
    );
  }

  const {
    data: activeSeason,
    error: seasonError,
  } =
    await supabase
      .from("seasons")
      .select(`
        id,
        year
      `)
      .eq(
        "league_id",
        input.leagueId,
      )
      .eq(
        "is_active",
        true,
      )
      .maybeSingle();

  if (seasonError) {
    throw new Error(
      seasonError.message,
    );
  }

  if (!activeSeason) {
    throw new Error(
      "This league does not have an active season.",
    );
  }

  const {
    data: existingEntitlement,
    error: entitlementError,
  } =
    await supabase
      .from("league_entitlements")
      .select(`
        id,
        status
      `)
      .eq(
        "league_id",
        input.leagueId,
      )
      .eq(
        "season_year",
        activeSeason.year,
      )
      .maybeSingle();

  if (entitlementError) {
    throw new Error(
      entitlementError.message,
    );
  }

  if (
    existingEntitlement?.status ===
    "paid"
  ) {
    throw new Error(
      "This league is already activated for the current season.",
    );
  }

  const origin =
    process.env.NEXT_PUBLIC_SITE_URL;

  if (!origin) {
    throw new Error(
      "Missing NEXT_PUBLIC_SITE_URL.",
    );
  }

  const session =
    await stripe.checkout.sessions.create({
      mode:
        "payment",

      line_items: [
        {
          price:
            STRIPE_PRICE_ID,

          quantity:
            1,
        },
      ],

      customer_email:
        user.email ??
        undefined,

      client_reference_id:
        input.leagueId,

      metadata: {
        league_id:
          input.leagueId,

        user_id:
          user.id,

        season_year:
          String(
            activeSeason.year,
          ),
      },

      success_url:
        `${origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url:
        `${origin}/payment/cancel?league_id=${input.leagueId}`,
    });

  if (!session.url) {
    throw new Error(
      "Stripe did not return a Checkout URL.",
    );
  }

  redirect(
    session.url,
  );
}
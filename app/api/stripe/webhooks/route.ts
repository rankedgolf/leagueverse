import { NextResponse } from "next/server";

import Stripe from "stripe";

import { getStripe } from "@/lib/stripe/server";
import { supabaseAdmin } from "@/lib/supabase/admin";

export async function POST(
  request: Request,
) {
    const stripe = getStripe();
  const signature =
    request.headers.get(
      "stripe-signature",
    );

  if (!signature) {
    return NextResponse.json(
      {
        error:
          "Missing Stripe signature.",
      },
      {
        status: 400,
      },
    );
  }

  const webhookSecret =
    process.env
      .STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return NextResponse.json(
      {
        error:
          "Stripe webhook secret is not configured.",
      },
      {
        status: 500,
      },
    );
  }

  const body =
    await request.text();

  let event: Stripe.Event;

  try {
    event =
      stripe.webhooks.constructEvent(
        body,
        signature,
        webhookSecret,
      );
  } catch (error) {
    console.error(
      "Stripe webhook signature verification failed:",
      error,
    );

    return NextResponse.json(
      {
        error:
          "Invalid webhook signature.",
      },
      {
        status: 400,
      },
    );
  }

  if (
    event.type ===
    "checkout.session.completed"
  ) {
    const session =
      event.data.object;

    await handleCheckoutCompleted(
      session,
    );
  }

  return NextResponse.json({
    received: true,
  });
}

async function handleCheckoutCompleted(
  session: Stripe.Checkout.Session,
) {
  if (
    session.payment_status !==
    "paid"
  ) {
    return;
  }

  const leagueId =
    session.metadata
      ?.league_id;

  const userId =
    session.metadata
      ?.user_id;

  const seasonYearRaw =
    session.metadata
      ?.season_year;

  if (
    !leagueId ||
    !userId ||
    !seasonYearRaw
  ) {
    throw new Error(
      "Stripe Checkout Session is missing LeagueVerse metadata.",
    );
  }

  const seasonYear =
    Number(
      seasonYearRaw,
    );

  if (
    !Number.isInteger(
      seasonYear,
    )
  ) {
    throw new Error(
      "Stripe Checkout Session contains an invalid season year.",
    );
  }

  const customerId =
    typeof session.customer ===
    "string"
      ? session.customer
      : session.customer?.id ??
        null;

  const paymentIntentId =
    typeof session.payment_intent ===
    "string"
      ? session.payment_intent
      : session.payment_intent?.id ??
        null;

const {
  error,
} =
  await supabaseAdmin
      .from(
        "league_entitlements",
      )
      .upsert(
        {
          league_id:
            leagueId,

          purchaser_user_id:
            userId,

          stripe_customer_id:
            customerId,

          stripe_checkout_session_id:
            session.id,

          stripe_payment_intent_id:
            paymentIntentId,

          stripe_price_id:
            process.env
              .STRIPE_FOUNDING_PASS_PRICE_ID ??
            null,

          status:
            "paid",

          amount_paid:
            session.amount_total ??
            null,

          currency:
            session.currency ??
            "usd",

          season_year:
            seasonYear,

          purchased_at:
            new Date()
              .toISOString(),

          updated_at:
            new Date()
              .toISOString(),
        },
        {
          onConflict:
            "league_id,season_year",
        },
      );

  if (error) {
    throw new Error(
      error.message,
    );
  }
}
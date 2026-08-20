import Stripe from "stripe";

let stripeInstance: Stripe | null = null;

export function getStripe() {
  if (stripeInstance) {
    return stripeInstance;
  }

  const stripeSecretKey =
    process.env.STRIPE_SECRET_KEY;

  if (!stripeSecretKey) {
    throw new Error(
      "STRIPE_SECRET_KEY is not configured.",
    );
  }

  stripeInstance =
    new Stripe(
      stripeSecretKey,
      {
        apiVersion:
          "2026-07-29.dahlia",
      },
    );

  return stripeInstance;
}

export const STRIPE_PRICE_ID =
  process.env
    .STRIPE_FOUNDING_PASS_PRICE_ID;
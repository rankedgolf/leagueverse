"use client";

import { useState } from "react";

import { createCheckoutSession } from "@/features/billing/actions/create-checkout-session";

type ActivateLeagueButtonProps = {
  leagueId: string;
};

export function ActivateLeagueButton({
  leagueId,
}: ActivateLeagueButtonProps) {
  const [isWorking, setIsWorking] =
    useState(false);

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null,
    );

  async function handleActivate() {
    setIsWorking(true);
    setErrorMessage(null);

    try {
      await createCheckoutSession({
        leagueId,
      });
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to start checkout.",
      );

      setIsWorking(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={
          handleActivate
        }
        disabled={
          isWorking
        }
        className="rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white transition hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isWorking
          ? "Opening Checkout..."
          : "Activate League • $19"}
      </button>

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
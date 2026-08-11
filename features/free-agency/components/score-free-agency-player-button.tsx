"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { scoreFreeAgencyPlayerOffers } from "@/features/free-agency/actions/score-free-agency-player-offers";

type ScoreFreeAgencyPlayerButtonProps = {
  leagueId: string;
  leaguePlayerId: string;
};

export function ScoreFreeAgencyPlayerButton({
  leagueId,
  leaguePlayerId,
}: ScoreFreeAgencyPlayerButtonProps) {
  const router = useRouter();

  const [isScoring, setIsScoring] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleScore() {
    setIsScoring(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const result =
        await scoreFreeAgencyPlayerOffers({
          leagueId,
          leaguePlayerId,
        });

      setMessage(
        `${result.offers.length} offers scored for ${result.playerName}.`,
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to score offers.",
      );
    } finally {
      setIsScoring(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleScore}
        disabled={isScoring}
        className="rounded-lg border border-amber-700 bg-amber-950/30 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-950/50 disabled:opacity-50"
      >
        {isScoring
          ? "Scoring..."
          : "Score Offers"}
      </button>

      {message ? (
        <p className="text-sm text-emerald-400">
          {message}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
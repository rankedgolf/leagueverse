"use client";

import {
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import { processSeasonTransition } from "@/features/season-transition/actions/process-season-transition";

type ProcessSeasonTransitionButtonProps = {
  leagueId: string;
  currentSeasonId: string;

  currentSeasonYear: number;
  nextSeasonYear: number;

  playersToCarryForward: number;

  readyToTransition: boolean;
};

export function ProcessSeasonTransitionButton({
  leagueId,
  currentSeasonId,
  currentSeasonYear,
  nextSeasonYear,
  playersToCarryForward,
  readyToTransition,
}: ProcessSeasonTransitionButtonProps) {
  const router =
    useRouter();

  const [
    pending,
    startTransition,
  ] = useTransition();

  const [
    message,
    setMessage,
  ] =
    useState<string | null>(
      null,
    );

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null,
    );

  function handleTransition() {
    if (
      !readyToTransition
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Advance this league from ${currentSeasonYear} to ${nextSeasonYear}?

This will:
• archive the ${currentSeasonYear} season
• activate ${nextSeasonYear}
• create ${playersToCarryForward} missing roster row${
          playersToCarryForward === 1
            ? ""
            : "s"
        }
• provision the following season if needed

This is the final offseason transition.`,
      );

    if (!confirmed) {
      return;
    }

    setMessage(null);
    setErrorMessage(null);

    startTransition(
      async () => {
        try {
          const result =
            await processSeasonTransition({
              leagueId,
              currentSeasonId,
            });

          setMessage(
            `Season Transition complete. ${result.previousSeasonYear} → ${result.newSeasonYear}. ${result.rosterRowsMaterialized} roster row${
              result.rosterRowsMaterialized ===
              1
                ? ""
                : "s"
            } materialized.`,
          );

          router.refresh();
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to process Season Transition.",
          );
        }
      },
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={
          handleTransition
        }
        disabled={
          pending ||
          !readyToTransition
        }
        className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Advancing Season..."
          : `Advance to ${nextSeasonYear}`}
      </button>

      {!readyToTransition ? (
        <p className="mt-2 text-xs text-amber-300">
          Complete all offseason requirements before advancing the season.
        </p>
      ) : (
        <p className="mt-2 text-xs text-slate-500">
          This will archive {currentSeasonYear} and make {nextSeasonYear} the active league season.
        </p>
      )}

      {message ? (
        <p className="mt-3 text-sm text-emerald-400">
          {message}
        </p>
      ) : null}

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
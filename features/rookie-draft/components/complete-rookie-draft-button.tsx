"use client";

import {
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import { completeRookieDraft } from "@/features/rookie-draft/actions/complete-rookie-draft";

type CompleteRookieDraftButtonProps = {
  leagueId: string;
  operationSeasonId: string;
  draftSeasonId: string;
};

export function CompleteRookieDraftButton({
  leagueId,
  operationSeasonId,
  draftSeasonId,
}: CompleteRookieDraftButtonProps) {
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

  function handleComplete() {
    setMessage(null);
    setErrorMessage(null);

    startTransition(
      async () => {
        try {
          /*
           * First attempt does NOT
           * automatically forfeit anything.
           */
          const result =
            await completeRookieDraft({
              leagueId,
              operationSeasonId,
              draftSeasonId,

              forfeitRemaining:
                false,
            });

          /*
           * Remaining picks were found.
           * Ask commissioner before forfeiting.
           */
          if (
            result.requiresForfeit
          ) {
            const confirmed =
              window.confirm(
                `${result.remainingPicks} rookie draft pick${
                  result.remainingPicks ===
                  1
                    ? ""
                    : "s"
                } remain unused.

Do you want to forfeit the remaining picks and complete the Rookie Draft?

This will permanently mark those picks as forfeited.`,
              );

            if (!confirmed) {
              return;
            }

            const finalResult =
              await completeRookieDraft({
                leagueId,
                operationSeasonId,
                draftSeasonId,

                forfeitRemaining:
                  true,
              });

            setMessage(
              `Rookie Draft completed. ${finalResult.forfeitedPicks} remaining pick${
                finalResult.forfeitedPicks ===
                1
                  ? ""
                  : "s"
              } forfeited.`,
            );

            router.refresh();

            return;
          }

          setMessage(
            "Rookie Draft completed.",
          );

          router.refresh();
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to complete the Rookie Draft.",
          );
        }
      },
    );
  }

  return (
    <div>
      <button
        type="button"
        disabled={pending}
        onClick={
          handleComplete
        }
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Completing..."
          : "Complete Rookie Draft"}
      </button>

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
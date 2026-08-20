"use client";

import {
  useState,
  useTransition,
} from "react";

import { useRouter } from "next/navigation";

import { completeFreeAgency } from "@/features/free-agency/actions/complete-free-agency";

type CompleteFreeAgencyButtonProps = {
  leagueId: string;
  operationSeasonId: string;
  freeAgencyPeriodId: string;
};

export function CompleteFreeAgencyButton({
  leagueId,
  operationSeasonId,
  freeAgencyPeriodId,
}: CompleteFreeAgencyButtonProps) {
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
    const confirmed =
      window.confirm(
        "Complete Free Agency? Make sure all offers and signing transactions have been resolved.",
      );

    if (!confirmed) {
      return;
    }

    setMessage(null);
    setErrorMessage(null);

    startTransition(
      async () => {
        try {
          await completeFreeAgency({
            leagueId,
            operationSeasonId,
            freeAgencyPeriodId,
          });

          setMessage(
            "Free Agency is complete.",
          );

          router.refresh();
        } catch (error) {
          setErrorMessage(
            error instanceof Error
              ? error.message
              : "Unable to complete Free Agency.",
          );
        }
      },
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={
          handleComplete
        }
        disabled={pending}
        className="rounded-lg bg-emerald-700 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending
          ? "Completing..."
          : "Complete Free Agency"}
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
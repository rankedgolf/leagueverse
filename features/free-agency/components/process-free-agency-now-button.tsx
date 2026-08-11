"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { processFreeAgencyNow } from "@/features/free-agency/actions/process-free-agency-now";

type ProcessFreeAgencyNowButtonProps = {
  leagueId: string;
  periodId: string;
};

export function ProcessFreeAgencyNowButton({
  leagueId,
  periodId,
}: ProcessFreeAgencyNowButtonProps) {
  const router = useRouter();

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleProcess() {
    const confirmed =
      window.confirm(
        "Process all eligible Free Agency decisions now?",
      );

    if (!confirmed) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const result =
        await processFreeAgencyNow({
          leagueId,
          periodId,
        });

      setMessage(
        `Processed ${result.decisionsCreated} decision${
          result.decisionsCreated === 1
            ? ""
            : "s"
        }${
          result.failures.length > 0
            ? ` with ${result.failures.length} failure${
                result.failures.length === 1
                  ? ""
                  : "s"
              }.`
            : "."
        }`,
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to process Free Agency.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleProcess}
        disabled={isProcessing}
        className="rounded-lg border border-violet-700 bg-violet-950/30 px-4 py-2 text-sm font-semibold text-violet-300 hover:bg-violet-950/50 disabled:opacity-50"
      >
        {isProcessing
          ? "Processing..."
          : "Process Free Agency Now"}
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
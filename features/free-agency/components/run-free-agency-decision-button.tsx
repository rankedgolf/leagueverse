"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { runFreeAgencyDecision } from "@/features/free-agency/actions/run-free-agency-decision";

type RunFreeAgencyDecisionButtonProps = {
  leagueId: string;
  leaguePlayerId: string;
};

export function RunFreeAgencyDecisionButton({
  leagueId,
  leaguePlayerId,
}: RunFreeAgencyDecisionButtonProps) {
  const router = useRouter();

  const [isRunning, setIsRunning] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleRun() {
    const confirmed =
      window.confirm(
        "Run the automated Free Agency decision for this player? The winning offer will be accepted, other active offers declined, and a pending signing transaction will be created.",
      );

    if (!confirmed) {
      return;
    }

    setIsRunning(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const result =
        await runFreeAgencyDecision({
          leagueId,
          leaguePlayerId,
        });

      setMessage(
        `${result.playerName} selected an offer. Pending signing transaction created.`,
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to run the Free Agency decision.",
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleRun}
        disabled={isRunning}
        className="rounded-lg border border-violet-700 bg-violet-950/30 px-4 py-2 text-sm font-semibold text-violet-300 hover:bg-violet-950/50 disabled:opacity-50"
      >
        {isRunning
          ? "Running Decision..."
          : "Run Decision"}
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
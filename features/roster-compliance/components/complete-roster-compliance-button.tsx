"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { completeRosterCompliance } from "@/features/roster-compliance/actions/complete-roster-compliance";

type CompleteRosterComplianceButtonProps = {
  leagueId: string;
  operationSeasonId: string;
  allCompliant: boolean;
  nonCompliantTeams: number;
  alreadyCompleted: boolean;
};

export function CompleteRosterComplianceButton({
  leagueId,
  operationSeasonId,
  allCompliant,
  nonCompliantTeams,
  alreadyCompleted,
}: CompleteRosterComplianceButtonProps) {
  const router =
    useRouter();

  const [isWorking, setIsWorking] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleComplete() {
    if (
      !window.confirm(
        "Mark Roster Compliance complete? This will unlock Season Transition.",
      )
    ) {
      return;
    }

    setIsWorking(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const result =
        await completeRosterCompliance({
          leagueId,
          operationSeasonId,
        });

      setMessage(
        `${result.compliantTeams} of ${result.totalTeams} teams are compliant. Roster Compliance is complete.`,
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to complete Roster Compliance.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  if (alreadyCompleted) {
    return (
      <div className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950/30 p-3">
        <p className="text-sm font-semibold text-emerald-300">
          ✓ Roster Compliance Complete
        </p>

        <p className="mt-1 text-xs text-slate-400">
          Season Transition is now eligible to proceed.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleComplete}
        disabled={
          isWorking ||
          !allCompliant
        }
        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isWorking
          ? "Completing..."
          : "Complete Roster Compliance"}
      </button>

      {!allCompliant ? (
        <p className="mt-2 text-xs text-amber-300">
          {nonCompliantTeams} team
          {nonCompliantTeams === 1
            ? ""
            : "s"}{" "}
          must become compliant first.
        </p>
      ) : null}

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
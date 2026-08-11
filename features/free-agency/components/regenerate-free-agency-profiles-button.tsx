"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { regenerateFreeAgencyProfiles } from "@/features/free-agency/actions/regenerate-free-agency-profiles";

type RegenerateFreeAgencyProfilesButtonProps = {
  leagueId: string;
};

export function RegenerateFreeAgencyProfilesButton({
  leagueId,
}: RegenerateFreeAgencyProfilesButtonProps) {
  const router = useRouter();

  const [isRunning, setIsRunning] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleRegenerate() {
    const confirmed = window.confirm(
      "Regenerate all current free-agent personalities using Personality Engine v2? This should only be done during development before real offers begin.",
    );

    if (!confirmed) {
      return;
    }

    setIsRunning(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const result =
        await regenerateFreeAgencyProfiles(
          leagueId,
        );

      setMessage(
        `${result.deletedCount} old profiles removed · ${result.generatedCount} Personality v2 profiles generated`,
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to regenerate personalities.",
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleRegenerate}
        disabled={isRunning}
        className="rounded-lg border border-amber-700 bg-amber-950/30 px-4 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-950/50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRunning
          ? "Regenerating..."
          : "Regenerate Personality v2"}
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
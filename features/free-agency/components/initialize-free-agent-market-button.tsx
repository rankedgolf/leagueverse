"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { initializeFreeAgentMarket } from "@/features/free-agency/actions/initialize-free-agent-market";

type InitializeFreeAgentMarketButtonProps = {
  leagueId: string;
};

export function InitializeFreeAgentMarketButton({
  leagueId,
}: InitializeFreeAgentMarketButtonProps) {
  const router = useRouter();

  const [isRunning, setIsRunning] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleInitialize() {
    const confirmed = window.confirm(
      "Initialize the LeagueVerse free-agent market from Sleeper's NFL player database?",
    );

    if (!confirmed) {
      return;
    }

    setIsRunning(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const result =
        await initializeFreeAgentMarket(
          leagueId,
        );

      setMessage(
        [
          `${result.masterPlayerSync.processedCount} NFL players synced`,
          `${result.playerPool.createdFreeAgentCount} free agents created`,
          `${result.profiles.generatedCount} personalities generated`,
        ].join(" · "),
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to initialize the free-agent market.",
      );
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleInitialize}
        disabled={isRunning}
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isRunning
          ? "Initializing Market..."
          : "Initialize Free Agent Market"}
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
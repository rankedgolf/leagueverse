"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { processContractExpirations } from "@/features/contract-expirations/actions/process-contract-expirations";

type ProcessContractExpirationsButtonProps = {
  leagueId: string;
  seasonId: string;

  expiringCount: number;
  taggedCount: number;
  freeAgentCount: number;
};

export function ProcessContractExpirationsButton({
  leagueId,
  seasonId,
  expiringCount,
  taggedCount,
  freeAgentCount,
}: ProcessContractExpirationsButtonProps) {
  const router =
    useRouter();

  const [isProcessing, setIsProcessing] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleProcess() {
    const confirmed =
      window.confirm(
        `Process contract expirations?

Expiring contracts: ${expiringCount}
Franchise tagged: ${taggedCount}
Entering Free Agency: ${freeAgentCount}

This will expire contracts and move untagged players into Free Agency. This action cannot be undone.`,
      );

    if (!confirmed) {
      return;
    }

    setIsProcessing(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const result =
        await processContractExpirations({
          leagueId,
          seasonId,
        });

      setMessage(
        `Processed ${result.expiringCount} expiring contracts: ${result.taggedCount} tagged and ${result.freeAgentCount} moved to Free Agency.`,
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to process contract expirations.",
      );
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="mt-4">
      <button
        type="button"
        onClick={handleProcess}
        disabled={
          isProcessing ||
          expiringCount === 0
        }
        className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isProcessing
          ? "Processing..."
          : "Process Contract Expirations"}
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
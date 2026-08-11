"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { applyTransaction } from "@/features/transactions/actions/apply-transaction";

type ApplyTransactionButtonProps = {
  leagueId: string;
  transactionId: string;
  itemCount: number;
};

export function ApplyTransactionButton({
  leagueId,
  transactionId,
  itemCount,
}: ApplyTransactionButtonProps) {
  const router = useRouter();

  const [isApplying, setIsApplying] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleApply() {
    const confirmed = window.confirm(
      `Apply this approved transaction containing ${itemCount} player change${
        itemCount === 1 ? "" : "s"
      }?\n\nThis will update LeagueVerse rosters and contracts.`,
    );

    if (!confirmed) {
      return;
    }

    setIsApplying(true);
    setErrorMessage(null);

    try {
      await applyTransaction({
        leagueId,
        transactionId,
      });

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to apply the transaction.",
      );
    } finally {
      setIsApplying(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleApply}
        disabled={isApplying}
        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isApplying
          ? "Applying..."
          : "Apply Transaction"}
      </button>

      {errorMessage ? (
        <p className="max-w-md text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
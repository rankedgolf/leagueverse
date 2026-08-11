"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { approveAllTransactions } from "@/features/transactions/actions/approve-all-transactions";

type ApproveAllTransactionsButtonProps = {
  leagueId: string;
  pendingCount: number;
};

export function ApproveAllTransactionsButton({
  leagueId,
  pendingCount,
}: ApproveAllTransactionsButtonProps) {
  const router = useRouter();

  const [isApproving, setIsApproving] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function handleApproveAll() {
    const confirmed = window.confirm(
      `Approve all ${pendingCount} pending transaction${
        pendingCount === 1 ? "" : "s"
      }?\n\nThis approves them for application but does not change rosters or contracts yet.`,
    );

    if (!confirmed) {
      return;
    }

    setIsApproving(true);
    setErrorMessage(null);

    try {
      await approveAllTransactions({
        leagueId,
      });

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to approve the pending transactions.",
      );
    } finally {
      setIsApproving(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleApproveAll}
        disabled={
          isApproving ||
          pendingCount === 0
        }
        className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isApproving
          ? "Approving All..."
          : `Approve All (${pendingCount})`}
      </button>

      {errorMessage ? (
        <p className="text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}
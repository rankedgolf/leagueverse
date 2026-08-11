"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { approveTransaction } from "@/features/transactions/actions/approve-transaction";
import { rejectTransaction } from "@/features/transactions/actions/reject-transaction";

type TransactionReviewControlsProps = {
  leagueId: string;
  transactionId: string;
  itemCount: number;
};

export function TransactionReviewControls({
  leagueId,
  transactionId,
  itemCount,
}: TransactionReviewControlsProps) {
  const router = useRouter();

  const [activeAction, setActiveAction] =
    useState<"approve" | "reject" | null>(
      null,
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const isBusy = activeAction !== null;

  async function handleApprove() {
    const confirmed = window.confirm(
      `Approve this transaction containing ${itemCount} player change${
        itemCount === 1 ? "" : "s"
      }?\n\nApproval does not apply the roster changes yet.`,
    );

    if (!confirmed) {
      return;
    }

    setActiveAction("approve");
    setErrorMessage(null);

    try {
      await approveTransaction({
        leagueId,
        transactionId,
      });

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to approve the transaction.",
      );
    } finally {
      setActiveAction(null);
    }
  }

  async function handleReject() {
    const confirmed = window.confirm(
      "Reject this transaction? It will remain in transaction history but cannot be applied.",
    );

    if (!confirmed) {
      return;
    }

    setActiveAction("reject");
    setErrorMessage(null);

    try {
      await rejectTransaction({
        leagueId,
        transactionId,
      });

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to reject the transaction.",
      );
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <div className="space-y-3">
      {errorMessage ? (
        <div className="rounded-lg border border-red-900/60 bg-red-950/30 p-3 text-sm text-red-300">
          {errorMessage}
        </div>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">
          Review the detected changes before approving them for
          application.
        </p>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleReject}
            disabled={isBusy}
            className="rounded-lg border border-red-900/60 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {activeAction === "reject"
              ? "Rejecting..."
              : "Reject"}
          </button>

          <button
            type="button"
            onClick={handleApprove}
            disabled={isBusy}
            className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {activeAction === "approve"
              ? "Approving..."
              : "Approve"}
          </button>
        </div>
      </div>
    </div>
  );
}
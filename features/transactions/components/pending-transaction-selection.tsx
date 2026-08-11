"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { reviewSelectedTransactions } from "@/features/transactions/actions/review-selected-transactions";
import { TransactionReviewControls } from "@/features/transactions/components/transaction-review-controls";
import type { TransactionDTO } from "@/features/transactions/dto/transaction-dto";

type PendingTransactionSelectionProps = {
  leagueId: string;
  transactions: TransactionDTO[];
};

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Unavailable";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function formatLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export function PendingTransactionSelection({
  leagueId,
  transactions,
}: PendingTransactionSelectionProps) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [activeAction, setActiveAction] =
    useState<"approve" | "reject" | null>(
      null,
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const allSelected =
    transactions.length > 0 &&
    selectedIds.length ===
      transactions.length;

  const isBusy = activeAction !== null;

  function toggleTransaction(
    transactionId: string,
  ) {
    setSelectedIds((current) =>
      current.includes(transactionId)
        ? current.filter(
            (id) => id !== transactionId,
          )
        : [...current, transactionId],
    );
  }

  function toggleAll() {
    setSelectedIds(
      allSelected
        ? []
        : transactions.map(
            (transaction) => transaction.id,
          ),
    );
  }

  async function handleBulkReview(
    action: "approve" | "reject",
  ) {
    if (selectedIds.length === 0) {
      setErrorMessage(
        "Select at least one transaction.",
      );

      return;
    }

    const confirmed = window.confirm(
      `${formatLabel(action)} ${
        selectedIds.length
      } selected transaction${
        selectedIds.length === 1
          ? ""
          : "s"
      }?`,
    );

    if (!confirmed) {
      return;
    }

    setActiveAction(action);
    setErrorMessage(null);

    try {
      await reviewSelectedTransactions({
        leagueId,
        transactionIds: selectedIds,
        action,
      });

      setSelectedIds([]);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : `Unable to ${action} the selected transactions.`,
      );
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-white">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              disabled={isBusy}
              className="h-4 w-4 rounded border-slate-600 bg-slate-950 accent-emerald-500"
            />

            Select All
          </label>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span className="text-sm text-slate-400">
              {selectedIds.length} selected
            </span>

            <button
              type="button"
              onClick={() =>
                handleBulkReview("reject")
              }
              disabled={
                isBusy ||
                selectedIds.length === 0
              }
              className="rounded-lg border border-red-900/60 px-4 py-2 text-sm font-semibold text-red-400 hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activeAction === "reject"
                ? "Rejecting..."
                : "Reject Selected"}
            </button>

            <button
              type="button"
              onClick={() =>
                handleBulkReview("approve")
              }
              disabled={
                isBusy ||
                selectedIds.length === 0
              }
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activeAction === "approve"
                ? "Approving..."
                : "Approve Selected"}
            </button>
          </div>
        </div>

        {errorMessage ? (
          <p className="mt-3 text-sm text-red-400">
            {errorMessage}
          </p>
        ) : null}
      </div>

      {transactions.map((transaction) => {
        const selected =
          selectedIds.includes(
            transaction.id,
          );

        return (
          <article
            key={transaction.id}
            className={`rounded-xl border bg-slate-900 ${
              selected
                ? "border-emerald-700 ring-1 ring-emerald-700/40"
                : "border-slate-800"
            }`}
          >
            <div className="flex flex-col gap-4 border-b border-slate-800 p-5 sm:flex-row sm:items-start sm:justify-between">
              <div className="flex items-start gap-4">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() =>
                    toggleTransaction(
                      transaction.id,
                    )
                  }
                  disabled={isBusy}
                  aria-label={`Select ${formatLabel(
                    transaction.type,
                  )}`}
                  className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950 accent-emerald-500"
                />

                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-lg font-semibold text-white">
                      {formatLabel(
                        transaction.type,
                      )}
                    </h3>

                    <span className="rounded-full border border-amber-900/60 bg-amber-950/40 px-2.5 py-1 text-xs font-medium text-amber-300">
                      Pending
                    </span>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    {formatLabel(
                      transaction.source,
                    )}
                    {transaction.provider
                      ? ` · ${formatLabel(
                          transaction.provider,
                        )}`
                      : ""}
                  </p>

                  {transaction.notes ? (
                    <p className="mt-2 text-sm text-slate-300">
                      {transaction.notes}
                    </p>
                  ) : null}
                </div>
              </div>

              <div className="text-left text-xs text-slate-500 sm:text-right">
                <p>
                  Occurred:{" "}
                  {formatDateTime(
                    transaction.occurredAt,
                  )}
                </p>

                <p className="mt-1 break-all">
                  ID: {transaction.id}
                </p>
              </div>
            </div>

            <div className="divide-y divide-slate-800">
              {transaction.items.map(
                (item) => {
                  const playerName =
                    typeof item.metadata
                      .playerName === "string"
                      ? item.metadata
                          .playerName
                      : "Player";

                  const message =
                    typeof item.metadata
                      .message === "string"
                      ? item.metadata.message
                      : null;

                  return (
                    <div
                      key={item.id}
                      className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between"
                    >
                      <div>
                        <p className="font-medium text-white">
                          {playerName}
                        </p>

                        {message ? (
                          <p className="mt-1 text-sm text-slate-400">
                            {message}
                          </p>
                        ) : null}

                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.rosterAction ? (
                            <span className="rounded-full border border-blue-900/60 bg-blue-950/40 px-2.5 py-1 text-xs font-medium text-blue-300">
                              Roster:{" "}
                              {formatLabel(
                                item.rosterAction,
                              )}
                            </span>
                          ) : null}

                          {item.contractAction ? (
                            <span className="rounded-full border border-violet-900/60 bg-violet-950/40 px-2.5 py-1 text-xs font-medium text-violet-300">
                              Contract:{" "}
                              {formatLabel(
                                item.contractAction,
                              )}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <div className="grid min-w-[300px] grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
                        <TeamReference
                          label="From Team"
                          value={
                            item.fromTeamId ??
                            "Free Agent"
                          }
                        />

                        <span className="text-slate-600">
                          →
                        </span>

                        <TeamReference
                          label="To Team"
                          value={
                            item.toTeamId ??
                            "Free Agent"
                          }
                          align="right"
                        />
                      </div>
                    </div>
                  );
                },
              )}
            </div>

            <div className="border-t border-slate-800 p-5">
              <TransactionReviewControls
                leagueId={transaction.leagueId}
                transactionId={transaction.id}
                itemCount={
                  transaction.items.length
                }
              />
            </div>
          </article>
        );
      })}
    </div>
  );
}

type TeamReferenceProps = {
  label: string;
  value: string;
  align?: "left" | "right";
};

function TeamReference({
  label,
  value,
  align = "left",
}: TeamReferenceProps) {
  return (
    <div
      className={
        align === "right"
          ? "text-right"
          : "text-left"
      }
    >
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-all font-medium text-white">
        {value}
      </p>
    </div>
  );
}
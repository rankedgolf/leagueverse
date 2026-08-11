"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { applyAllApprovedTransactions } from "@/features/transactions/actions/apply-all-approved-transactions";
import { applySelectedTransactions } from "@/features/transactions/actions/apply-selected-transactions";
import { ApplyTransactionButton } from "@/features/transactions/components/apply-transaction-button";
import type { TransactionDTO } from "@/features/transactions/dto/transaction-dto";

type ApprovedTransactionSelectionProps = {
  leagueId: string;
  transactions: TransactionDTO[];
};

function formatLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export function ApprovedTransactionSelection({
  leagueId,
  transactions,
}: ApprovedTransactionSelectionProps) {
  const router = useRouter();

  const [selectedIds, setSelectedIds] =
    useState<string[]>([]);

  const [activeAction, setActiveAction] =
    useState<
      "selected" | "all" | null
    >(null);

  const [message, setMessage] =
    useState<string | null>(null);

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
            (transaction) =>
              transaction.id,
          ),
    );
  }

  async function handleApplySelected() {
    if (selectedIds.length === 0) {
      return;
    }

    const confirmed = window.confirm(
      `Apply ${selectedIds.length} selected approved transaction${
        selectedIds.length === 1
          ? ""
          : "s"
      }?\n\nThis will update LeagueVerse rosters and contracts.`,
    );

    if (!confirmed) {
      return;
    }

    setActiveAction("selected");
    setErrorMessage(null);
    setMessage(null);

    try {
      const result =
        await applySelectedTransactions({
          leagueId,
          transactionIds:
            selectedIds,
        });

      setSelectedIds([]);

      setMessage(
        `${result.completedCount} completed${
          result.failedCount > 0
            ? ` · ${result.failedCount} failed`
            : ""
        }.`,
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to apply selected transactions.",
      );
    } finally {
      setActiveAction(null);
    }
  }

  async function handleApplyAll() {
    const confirmed = window.confirm(
      `Apply all ${transactions.length} approved transaction${
        transactions.length === 1
          ? ""
          : "s"
      }?\n\nThis will update LeagueVerse rosters and contracts.`,
    );

    if (!confirmed) {
      return;
    }

    setActiveAction("all");
    setErrorMessage(null);
    setMessage(null);

    try {
      const result =
        await applyAllApprovedTransactions({
          leagueId,
        });

      setSelectedIds([]);

      setMessage(
        `${result.completedCount} completed${
          result.failedCount > 0
            ? ` · ${result.failedCount} failed`
            : ""
        }.`,
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to apply approved transactions.",
      );
    } finally {
      setActiveAction(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-blue-900/40 bg-blue-950/20 p-4">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <label className="flex cursor-pointer items-center gap-3 text-sm font-medium text-white">
            <input
              type="checkbox"
              checked={allSelected}
              onChange={toggleAll}
              disabled={isBusy}
              className="h-4 w-4 rounded border-slate-600 bg-slate-950 accent-blue-500"
            />

            Select All Approved
          </label>

          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-slate-400">
              {selectedIds.length} selected
            </span>

            <button
              type="button"
              onClick={
                handleApplySelected
              }
              disabled={
                isBusy ||
                selectedIds.length === 0
              }
              className="rounded-lg border border-blue-700 px-4 py-2 text-sm font-semibold text-blue-300 hover:bg-blue-950/50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activeAction === "selected"
                ? "Applying Selected..."
                : "Apply Selected"}
            </button>

            <button
              type="button"
              onClick={handleApplyAll}
              disabled={
                isBusy ||
                transactions.length === 0
              }
              className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {activeAction === "all"
                ? "Applying All..."
                : `Apply All Approved (${transactions.length})`}
            </button>
          </div>
        </div>

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

      {transactions.map(
        (transaction) => {
          const selected =
            selectedIds.includes(
              transaction.id,
            );

          return (
            <article
              key={transaction.id}
              className={`rounded-xl border bg-slate-900 ${
                selected
                  ? "border-blue-600 ring-1 ring-blue-600/40"
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
                    className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-950 accent-blue-500"
                  />

                  <div>
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="text-lg font-semibold text-white">
                        {formatLabel(
                          transaction.type,
                        )}
                      </h3>

                      <span className="rounded-full border border-blue-900/60 bg-blue-950/40 px-2.5 py-1 text-xs font-medium text-blue-300">
                        Approved
                      </span>
                    </div>

                    {transaction.notes ? (
                      <p className="mt-2 text-sm text-slate-300">
                        {transaction.notes}
                      </p>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="divide-y divide-slate-800">
                {transaction.items.map(
                  (item) => {
                    const playerName =
                      typeof item.metadata
                        .playerName ===
                      "string"
                        ? item.metadata
                            .playerName
                        : "Player";

                    return (
                      <div
                        key={item.id}
                        className="p-5"
                      >
                        <p className="font-medium text-white">
                          {playerName}
                        </p>

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
                    );
                  },
                )}
              </div>

              <div className="flex flex-col gap-4 border-t border-blue-900/40 bg-blue-950/20 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-medium text-blue-300">
                    Approved for application
                  </p>

                  <p className="mt-1 text-sm text-slate-400">
                    Apply individually or include this transaction in a bulk application.
                  </p>
                </div>

                <ApplyTransactionButton
                  leagueId={
                    transaction.leagueId
                  }
                  transactionId={
                    transaction.id
                  }
                  itemCount={
                    transaction.items.length
                  }
                />
              </div>
            </article>
          );
        },
      )}
    </div>
  );
}
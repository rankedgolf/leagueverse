"use client";

import { useState } from "react";

import { previewSleeperSync } from "@/features/integrations/actions/preview-sleeper-sync";
import type {
  SleeperSyncPlayerChangeDTO,
  SleeperSyncPreviewDTO,
  SleeperSyncTeamChangeDTO,
} from "@/features/integrations/dto/sleeper-sync-preview-dto";
import { createSleeperSyncTransactions } from "@/features/integrations/actions/create-sleeper-sync-transaction";
import type { CreateSleeperSyncTransactionsResult } from "@/features/integrations/services/sleeper-sync-transaction-service";

type SleeperSyncPreviewProps = {
  leagueId: string;
};

function formatDateTime(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function getChangeLabel(
  changeType: SleeperSyncPlayerChangeDTO["changeType"],
): string {
  switch (changeType) {
    case "add":
      return "Add";
    case "drop":
      return "Drop";
    case "move":
      return "Move";
    case "unmatched":
      return "Unmatched";
  }
}

function getChangeClasses(
  changeType: SleeperSyncPlayerChangeDTO["changeType"],
): string {
  switch (changeType) {
    case "add":
      return "border-emerald-900/60 bg-emerald-950/40 text-emerald-300";

    case "drop":
      return "border-red-900/60 bg-red-950/40 text-red-300";

    case "move":
      return "border-blue-900/60 bg-blue-950/40 text-blue-300";

    case "unmatched":
      return "border-amber-900/60 bg-amber-950/40 text-amber-300";
  }
}

export function SleeperSyncPreview({
  leagueId,
}: SleeperSyncPreviewProps) {
  const [preview, setPreview] =
    useState<SleeperSyncPreviewDTO | null>(null);

  const [isLoading, setIsLoading] = useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [isCreatingTransaction, setIsCreatingTransaction] =
    useState(false);

  const [createdBatch, setCreatedBatch] =
    useState<CreateSleeperSyncTransactionsResult | null>(
      null,
    );

  async function handlePreviewSync() {
    setIsLoading(true);
    setErrorMessage(null);
    setCreatedBatch(null);

    try {
      const result = await previewSleeperSync({
        leagueId,
      });

      setPreview(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to preview the Sleeper roster sync.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleCreateTransactions() {
    if (!preview?.hasChanges) {
      return;
    }

    setIsCreatingTransaction(true);
    setErrorMessage(null);

    try {
      const result =
        await createSleeperSyncTransactions({
          leagueId,
        });

      setCreatedBatch(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to create the pending transactions.",
      );
    } finally {
      setIsCreatingTransaction(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-white">
              Compare Rosters
            </h2>

            <p className="mt-2 max-w-2xl text-sm text-slate-400">
              LeagueVerse will compare the active-season roster
              records against the latest rosters returned by Sleeper.
            </p>
          </div>

          <button
            type="button"
            onClick={handlePreviewSync}
            disabled={isLoading}
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoading
              ? "Comparing Rosters..."
              : preview
                ? "Refresh Sync Preview"
                : "Preview Roster Sync"}
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
            {errorMessage}
          </div>
        ) : null}
      </section>

      {preview ? (
        <>
          <section
            className={`rounded-xl border p-5 ${
              preview.hasChanges
                ? "border-amber-900/60 bg-amber-950/20"
                : "border-emerald-900/60 bg-emerald-950/20"
            }`}
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p
                  className={`text-xs font-semibold uppercase tracking-wide ${
                    preview.hasChanges
                      ? "text-amber-400"
                      : "text-emerald-400"
                  }`}
                >
                  Sync Preview Complete
                </p>

                <h2 className="mt-2 text-xl font-bold text-white">
                  {preview.hasChanges
                    ? "Roster Changes Detected"
                    : "LeagueVerse Is In Sync"}
                </h2>

                <p className="mt-2 text-sm text-slate-300">
                  Generated {formatDateTime(preview.generatedAt)}.
                  No LeagueVerse data has been changed.
                </p>
              </div>

              <span
                className={`rounded-full border px-3 py-1 text-xs font-medium ${
                  preview.canApplyAutomatically
                    ? "border-emerald-800 bg-emerald-950 text-emerald-300"
                    : "border-amber-800 bg-amber-950 text-amber-300"
                }`}
              >
                {preview.canApplyAutomatically
                  ? "Eligible to Apply"
                  : "Review Required"}
              </span>
            </div>
          </section>

          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              label="Sleeper Players"
              value={String(preview.sleeperRosterCount)}
              detail={`${preview.leagueVerseRosterCount} in LeagueVerse`}
            />

            <SummaryCard
              label="Adds"
              value={String(preview.addedPlayerCount)}
              detail="Rostered in Sleeper only"
              valueClassName={
                preview.addedPlayerCount > 0
                  ? "text-emerald-400"
                  : "text-white"
              }
            />

            <SummaryCard
              label="Drops"
              value={String(preview.droppedPlayerCount)}
              detail="Rostered in LeagueVerse only"
              valueClassName={
                preview.droppedPlayerCount > 0
                  ? "text-red-400"
                  : "text-white"
              }
            />

            <SummaryCard
              label="Moves"
              value={String(preview.movedPlayerCount)}
              detail={`${preview.unmatchedPlayerCount} unmatched`}
              valueClassName={
                preview.movedPlayerCount > 0 ||
                preview.unmatchedPlayerCount > 0
                  ? "text-amber-400"
                  : "text-white"
              }
            />
          </section>

          {preview.playerChanges.length > 0 ? (
            <section className="rounded-xl border border-slate-800 bg-slate-900">
              <div className="border-b border-slate-800 p-5">
                <h2 className="text-lg font-semibold text-white">
                  Player Changes
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Review every player difference detected between
                  Sleeper and LeagueVerse.
                </p>
              </div>

              <div className="divide-y divide-slate-800">
                {preview.playerChanges.map((change) => (
                  <PlayerChangeRow
                    key={`${change.changeType}-${change.sleeperPlayerId}-${change.fromTeamId ?? "none"}-${change.toTeamId ?? "none"}`}
                    change={change}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {preview.teamChanges.length > 0 ? (
            <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Team Changes
                </h2>

                <p className="mt-1 text-sm text-slate-400">
                  Team names and Sleeper owner mappings changed since
                  the integration was last recorded.
                </p>
              </div>

              <div className="mt-5 space-y-3">
                {preview.teamChanges.map((change) => (
                  <TeamChangeCard
                    key={change.sleeperRosterId}
                    change={change}
                  />
                ))}
              </div>
            </section>
          ) : null}

          {preview.warnings.length > 0 ? (
            <section className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-5">
              <h2 className="text-lg font-semibold text-amber-300">
                Sync Warnings
              </h2>

              <div className="mt-4 space-y-3">
                {preview.warnings.map((warning, index) => (
                  <div
                    key={`${warning}-${index}`}
                    className="rounded-lg border border-amber-900/60 bg-amber-950/30 p-3 text-sm text-amber-300"
                  >
                    {warning}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

    {createdBatch ? (
  <section className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-5">
    <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
      Pending Transactions Created
    </p>

    <h2 className="mt-2 text-lg font-semibold text-white">
      Each Sleeper roster change can now be reviewed separately
    </h2>

    <p className="mt-2 text-sm text-slate-300">
      {createdBatch.transactions.length} individual transaction
      {createdBatch.transactions.length === 1 ? "" : "s"} included.
    </p>

    <p className="mt-1 text-sm text-slate-400">
      {createdBatch.createdCount} created ·{" "}
      {createdBatch.existingCount} already existed. No roster or
      contract records have been changed yet.
    </p>

    <a
      href={`/leagues/${leagueId}/transactions`}
      className="mt-4 inline-flex rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
    >
      Review Transactions
    </a>
  </section>
) : null}

          <div className="flex justify-end">
     <button
  type="button"
  onClick={handleCreateTransactions}
  disabled={
    !preview.hasChanges ||
    !preview.canApplyAutomatically ||
    isCreatingTransaction ||
    Boolean(createdBatch)
  }
  className="rounded-lg bg-emerald-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
>
  {isCreatingTransaction
    ? "Creating Transactions..."
    : createdBatch
      ? "Transactions Created"
      : "Create Pending Transactions"}
</button>
          </div>
        </>
      ) : null}
    </div>
  );
}

type PlayerChangeRowProps = {
  change: SleeperSyncPlayerChangeDTO;
};

function PlayerChangeRow({
  change,
}: PlayerChangeRowProps) {
  return (
    <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
      <div className="flex items-start gap-3">
        <span
          className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getChangeClasses(
            change.changeType,
          )}`}
        >
          {getChangeLabel(change.changeType)}
        </span>

        <div>
          <p className="font-medium text-white">
            {change.playerName}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            {change.message}
          </p>

          {change.requiresCommissionerReview ? (
            <p className="mt-2 text-xs font-medium text-amber-400">
              Commissioner review required
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-[280px] grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
        <TeamDisplay
          label="From"
          value={change.fromTeamName ?? "Free Agent"}
        />

        <span className="text-slate-600">→</span>

        <TeamDisplay
          label="To"
          value={change.toTeamName ?? "Free Agent"}
          align="right"
        />
      </div>
    </div>
  );
}

type TeamChangeCardProps = {
  change: SleeperSyncTeamChangeDTO;
};

function TeamChangeCard({
  change,
}: TeamChangeCardProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-medium text-white">
            {change.currentLeagueVerseName}
          </p>

          <p className="mt-1 text-sm text-slate-400">
            Sleeper roster {change.sleeperRosterId}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {change.nameChanged ? (
            <span className="rounded-full border border-blue-900/60 bg-blue-950/40 px-2.5 py-1 text-xs font-medium text-blue-300">
              Name Changed
            </span>
          ) : null}

          {change.ownerChanged ? (
            <span className="rounded-full border border-amber-900/60 bg-amber-950/40 px-2.5 py-1 text-xs font-medium text-amber-300">
              Owner Changed
            </span>
          ) : null}
        </div>
      </div>

      {change.nameChanged ? (
        <p className="mt-3 text-sm text-slate-300">
          Sleeper name:{" "}
          <span className="font-medium text-white">
            {change.currentSleeperName}
          </span>
        </p>
      ) : null}
    </div>
  );
}

type TeamDisplayProps = {
  label: string;
  value: string;
  align?: "left" | "right";
};

function TeamDisplay({
  label,
  value,
  align = "left",
}: TeamDisplayProps) {
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

      <p className="mt-1 font-medium text-white">
        {value}
      </p>
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  detail: string;
  valueClassName?: string;
};

function SummaryCard({
  label,
  value,
  detail,
  valueClassName = "text-white",
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${valueClassName}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}
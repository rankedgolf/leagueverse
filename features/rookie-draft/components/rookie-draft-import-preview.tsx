"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  importRookieDraftResults,
} from "@/features/rookie-draft/actions/import-rookie-draft-results";

import type {
  RookieDraftImportPreview as RookieDraftImportPreviewData,
} from "@/features/rookie-draft/import/rookie-draft-import-preview-service";

type RookieDraftImportPreviewProps = {
  leagueId: string;

  preview:
    RookieDraftImportPreviewData;
};

export function RookieDraftImportPreview({
  leagueId,
  preview,
}: RookieDraftImportPreviewProps) {
  const router =
    useRouter();

  const [isImporting, setIsImporting] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(
      null,
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(
      null,
    );

  const validRows =
    preview.rows.filter(
      (row) =>
        row.isValid &&
        row.playerId &&
        row.overallPick !== null,
    );

  async function handleImport() {
    if (
      validRows.length === 0
    ) {
      return;
    }

    const confirmed =
      window.confirm(
        `Import ${validRows.length} rookie draft selection${
          validRows.length === 1
            ? ""
            : "s"
        }?

This will add the players to their teams, consume the draft picks, and create automatic rookie contracts.`,
      );

    if (!confirmed) {
      return;
    }

    setIsImporting(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const result =
        await importRookieDraftResults({
          leagueId,

          draftSeasonId:
            preview.draftSeasonId,

          selections:
            validRows.map(
              (row) => ({
                round:
                  row.round,

                overallPick:
                  row.overallPick!,

                playerId:
                  row.playerId!,
              }),
            ),
        });

      setMessage(
        `${result.importedCount} rookie draft selection${
          result.importedCount === 1
            ? ""
            : "s"
        } imported successfully.`,
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to import Rookie Draft results.",
      );
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="mt-5 border-t border-slate-800 pt-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <InfoCard
          label="Rows"
          value={String(
            preview.totalRows,
          )}
        />

        <InfoCard
          label="Valid"
          value={String(
            preview.validRows,
          )}
        />

        <InfoCard
          label="Errors"
          value={String(
            preview.invalidRows,
          )}
        />
      </div>

      <div className="mt-4 space-y-3">
        {preview.rows.map(
          (row) => (
            <div
              key={
                row.rowNumber
              }
              className="rounded-lg border border-slate-800 bg-slate-900 p-3"
            >
              <div className="flex items-center justify-between gap-3">
                <p className="font-semibold text-white">
                  {row.round}.
                  {String(
                    row.roundPick,
                  ).padStart(
                    2,
                    "0",
                  )}{" "}
                  {row.playerName}
                </p>

                <p
                  className={
                    row.isValid
                      ? "text-emerald-400"
                      : "text-red-400"
                  }
                >
                  {row.isValid
                    ? "✓"
                    : "✕"}
                </p>
              </div>

              <p className="mt-1 text-sm text-slate-400">
                {row.teamName ??
                  "Team unavailable"}
              </p>

              <p className="text-sm text-slate-400">
                {row.contractYears}
                -year contract · $
                {
                  row.startingSalary
                }
              </p>

              {!row.isValid ? (
                <div className="mt-2 space-y-1">
                  {row.errors.map(
                    (error) => (
                      <p
                        key={error}
                        className="text-xs text-red-400"
                      >
                        {error}
                      </p>
                    ),
                  )}
                </div>
              ) : null}
            </div>
          ),
        )}
      </div>

      {validRows.length > 0 ? (
        <div className="mt-5 border-t border-slate-800 pt-4">
          <button
            type="button"
            onClick={
              handleImport
            }
            disabled={
              isImporting
            }
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isImporting
              ? "Importing..."
              : `Import ${validRows.length} Rookie Selection${
                  validRows.length ===
                  1
                    ? ""
                    : "s"
                }`}
          </button>

          {preview.invalidRows > 0 ? (
            <p className="mt-2 text-xs text-amber-300">
              Only valid selections will be imported. Fix the remaining errors and import them separately.
            </p>
          ) : (
            <p className="mt-2 text-xs text-slate-500">
              Players will be added to the team that currently owns each draft pick and receive their automatic one-year rookie contract.
            </p>
          )}

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
      ) : null}
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
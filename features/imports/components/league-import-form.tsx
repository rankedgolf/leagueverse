"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";

import {
  parseLeagueImport,
  type LeagueImportRow,
} from "@/features/imports/parsers/league-import-parser";
import { previewLeagueImport } from "@/features/imports/actions/preview-league-import";
import {
  importLeague,
  type LeagueImportExecutionResult,
} from "@/features/imports/actions/import-league";
import type { LeagueImportPreview } from "@/features/imports/services/league-import-preview-service";

type LeagueImportFormProps = {
  leagueId: string;
};

type CsvRecord = Record<string, string>;

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function getMatchStatusLabel(
  status: LeagueImportPreview["rows"][number]["matchStatus"]
): string {
  switch (status) {
    case "existing_league_player":
      return "Existing league player";

    case "existing_global_player":
      return "Will add to league";

    case "new_global_player":
      return "Will create player";

    default:
      return "Unknown";
  }
}

export function LeagueImportForm({
  leagueId,
}: LeagueImportFormProps) {
  const router = useRouter();

  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<LeagueImportRow[]>([]);
  const [preview, setPreview] =
    useState<LeagueImportPreview | null>(null);

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [importResult, setImportResult] =
    useState<LeagueImportExecutionResult | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    setRows([]);
    setPreview(null);
    setImportResult(null);
    setErrorMessage(null);

    if (!file) {
      setFileName(null);
      return;
    }

    if (!file.name.toLowerCase().endsWith(".csv")) {
      setFileName(null);
      setErrorMessage("Please select a CSV file.");
      event.target.value = "";
      return;
    }

    setFileName(file.name);

    Papa.parse<CsvRecord>(file, {
      header: true,
      skipEmptyLines: "greedy",

      transformHeader: (header) =>
        header.trim().toLowerCase().replace(/\s+/g, "_"),

      complete: (result) => {
        if (result.errors.length > 0) {
          setRows([]);

          setErrorMessage(
            result.errors
              .map((parseError) => parseError.message)
              .join(" ")
          );

          return;
        }

        const parsedRows = parseLeagueImport(result.data);

        setRows(parsedRows);

        if (parsedRows.length === 0) {
          setErrorMessage(
            "The CSV file does not contain any player rows."
          );
        }
      },

      error: (error) => {
        setRows([]);
        setErrorMessage(error.message);
      },
    });
  }

  async function handlePreview() {
    if (rows.length === 0) {
      setErrorMessage(
        "Select a valid CSV file before generating a preview."
      );

      return;
    }

    setIsPreviewing(true);
    setPreview(null);
    setImportResult(null);
    setErrorMessage(null);

    try {
      const result = await previewLeagueImport({
        leagueId,
        rows,
      });

      setPreview(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to preview the league import."
      );
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleImport() {
    if (!preview || preview.validRows === 0) {
      return;
    }

    setIsImporting(true);
    setImportResult(null);
    setErrorMessage(null);

    try {
      const result = await importLeague({
        leagueId,
        preview,
      });

      setImportResult(result);

      if (result.imported > 0) {
        const refreshedPreview = await previewLeagueImport({
          leagueId,
          rows,
        });

        setPreview(refreshedPreview);
        router.refresh();
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to import the league."
      );
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Import League Players
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Upload players, roster assignments, first-year salaries,
            and contract lengths in one file.
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm font-medium text-slate-300">
            Recommended CSV headers
          </p>

          <code className="mt-2 block overflow-x-auto text-sm text-slate-400">
            fantasy_team,player_name,position,pro_team,starting_salary,contract_years
          </code>

          <p className="mt-3 text-xs text-slate-500">
            Optional: first_name, last_name, sport,
            external_player_id
          </p>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="league-import-file"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              CSV file
            </label>

            <input
              id="league-import-file"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={isImporting}
              className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-950 disabled:opacity-50"
            />

            {fileName ? (
              <p className="mt-2 text-xs text-slate-500">
                {fileName} · {rows.length} rows detected
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handlePreview}
            disabled={
              isPreviewing ||
              isImporting ||
              rows.length === 0
            }
            className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isPreviewing
              ? "Building Preview..."
              : "Preview League Import"}
          </button>
        </div>

        {errorMessage ? (
          <div className="mt-4 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
            {errorMessage}
          </div>
        ) : null}
      </section>

      {preview ? (
        <section className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
            <SummaryCard
              label="Total Rows"
              value={preview.totalRows}
            />

            <SummaryCard
              label="Ready"
              value={preview.validRows}
              valueClassName="text-emerald-400"
            />

            <SummaryCard
              label="Errors"
              value={preview.invalidRows}
              valueClassName="text-red-400"
            />

            <SummaryCard
              label="New Players"
              value={preview.newGlobalPlayers}
            />

            <SummaryCard
              label="Add to League"
              value={preview.newLeaguePlayers}
            />

            <SummaryCard
              label="Already in League"
              value={preview.existingLeaguePlayers}
            />
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">Row</th>
                  <th className="px-4 py-3 text-left">Player</th>
                  <th className="px-4 py-3 text-left">Team</th>
                  <th className="px-4 py-3 text-center">Pos</th>
                  <th className="px-4 py-3 text-center">Pro Team</th>
                  <th className="px-4 py-3 text-right">Year 1</th>
                  <th className="px-4 py-3 text-center">Years</th>
                  <th className="px-4 py-3 text-right">Total</th>
                  <th className="px-4 py-3 text-left">Match</th>
                  <th className="px-4 py-3 text-left">Result</th>
                </tr>
              </thead>

              <tbody>
                {preview.rows.map((previewRow) => (
                  <tr
                    key={previewRow.row.rowNumber}
                    className="border-t border-slate-800 align-top"
                  >
                    <td className="px-4 py-3 text-slate-500">
                      {previewRow.row.rowNumber}
                    </td>

                    <td className="px-4 py-3 font-medium text-white">
                      {previewRow.row.playerName}
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {previewRow.teamName ??
                        previewRow.row.fantasyTeam}
                    </td>

                    <td className="px-4 py-3 text-center text-slate-300">
                      {previewRow.row.position ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-center text-slate-300">
                      {previewRow.row.proTeam ?? "—"}
                    </td>

                    <td className="px-4 py-3 text-right text-slate-300">
                      {Number.isFinite(
                        previewRow.row.startingSalary
                      )
                        ? formatCurrency(
                            previewRow.row.startingSalary
                          )
                        : "Invalid"}
                    </td>

                    <td className="px-4 py-3 text-center text-slate-300">
                      {previewRow.row.contractYears}
                    </td>

                    <td className="px-4 py-3 text-right text-slate-300">
                      {previewRow.isValid
                        ? formatCurrency(previewRow.totalValue)
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      <span className="rounded-full bg-slate-800 px-2 py-1 text-xs text-slate-300">
                        {getMatchStatusLabel(
                          previewRow.matchStatus
                        )}
                      </span>
                    </td>

                    <td className="px-4 py-3">
                      {previewRow.isValid ? (
                        <div className="space-y-2">
                          <span className="rounded-full bg-emerald-950 px-2 py-1 text-xs font-medium text-emerald-300">
                            Ready
                          </span>

                          {previewRow.warnings.map((warning) => (
                            <p
                              key={warning}
                              className="text-xs text-amber-300"
                            >
                              {warning}
                            </p>
                          ))}
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {previewRow.errors.map((rowError) => (
                            <p
                              key={rowError}
                              className="text-xs text-red-300"
                            >
                              {rowError}
                            </p>
                          ))}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={handleImport}
              disabled={
                isImporting ||
                preview.validRows === 0
              }
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isImporting
                ? "Importing League..."
                : `Import ${preview.validRows} Player${
                    preview.validRows === 1 ? "" : "s"
                  }`}
            </button>

            <p className="text-xs text-slate-500">
              Invalid rows will be skipped.
            </p>
          </div>

          {importResult ? (
            <div
              className={`rounded-xl border p-5 ${
                importResult.failed > 0
                  ? "border-amber-800 bg-amber-950/40"
                  : "border-emerald-800 bg-emerald-950/40"
              }`}
            >
              <h3
                className={`font-semibold ${
                  importResult.failed > 0
                    ? "text-amber-300"
                    : "text-emerald-300"
                }`}
              >
                League Import Complete
              </h3>

         <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
  <ImportResultCard
    label="Imported"
    value={importResult.imported}
  />

  <ImportResultCard
    label="Players Created"
    value={importResult.createdPlayers}
  />

  <ImportResultCard
    label="League Records"
    value={importResult.createdLeaguePlayers}
  />

  <ImportResultCard
    label="Roster Assignments"
    value={importResult.createdRosterEntries}
  />

  <ImportResultCard
    label="Contracts Created"
    value={importResult.createdContracts}
  />
</div>

              {importResult.errors.length > 0 ? (
                <div className="mt-4">
                  <p className="text-sm font-medium text-red-300">
                    Errors
                  </p>

                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-200">
                    {importResult.errors.map(
                      (importError, index) => (
                        <li key={`${importError}-${index}`}>
                          {importError}
                        </li>
                      )
                    )}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: number;
  valueClassName?: string;
};

type ImportResultCardProps = {
  label: string;
  value: number;
};

function ImportResultCard({
  label,
  value,
}: ImportResultCardProps) {
  return (
    <div className="rounded-lg border border-slate-700 bg-slate-950/70 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  valueClassName = "text-white",
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
      <p className="text-sm text-slate-400">{label}</p>

      <p
        className={`mt-1 text-2xl font-bold ${valueClassName}`}
      >
        {value}
      </p>
    </div>
  );
}
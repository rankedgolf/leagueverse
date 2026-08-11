"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Papa from "papaparse";

import { previewContractImport } from "@/features/contracts/actions/preview-contract-import";
import {
  importContracts,
  type ContractImportResult,
} from "@/features/contracts/actions/import-contracts";
import {
  parseContractImport,
  type ContractImportRow,
} from "@/features/contracts/import/contract-import-parser";
import type { ContractImportPreview } from "@/features/contracts/import/contract-import-preview-service";

type ContractImportFormProps = {
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

export function ContractImportForm({
  leagueId,
}: ContractImportFormProps) {
  const router = useRouter();

  const [fileName, setFileName] = useState<string | null>(null);
  const [rows, setRows] = useState<ContractImportRow[]>([]);
  const [preview, setPreview] =
    useState<ContractImportPreview | null>(null);

  const [isPreviewing, setIsPreviewing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const [importResult, setImportResult] =
    useState<ContractImportResult | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  function handleFileChange(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    setPreview(null);
    setImportResult(null);
    setRows([]);
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

        const parsedRows = parseContractImport(result.data);

        setRows(parsedRows);

        if (parsedRows.length === 0) {
          setErrorMessage(
            "The CSV file does not contain any contract rows."
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
      const result = await previewContractImport({
        leagueId,
        rows,
      });

      setPreview(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to preview the contract import."
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
      const result = await importContracts(
        leagueId,
        preview
      );

      setImportResult(result);

      if (result.created > 0) {
        const refreshedPreview = await previewContractImport({
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
          : "Unable to import contracts."
      );
    } finally {
      setIsImporting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-800 bg-slate-900 p-5">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Import Contracts
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Upload a CSV containing fantasy team, player name,
            starting salary, and contract years.
          </p>
        </div>

        <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
          <p className="text-sm font-medium text-slate-300">
            Required CSV headers
          </p>

          <code className="mt-2 block overflow-x-auto text-sm text-slate-400">
            fantasy_team,player_name,starting_salary,contract_years
          </code>
        </div>

        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label
              htmlFor="contract-import-file"
              className="mb-2 block text-sm font-medium text-slate-300"
            >
              CSV file
            </label>

            <input
              id="contract-import-file"
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              disabled={isImporting}
              className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-300 file:mr-4 file:rounded-md file:border-0 file:bg-white file:px-3 file:py-1.5 file:text-sm file:font-semibold file:text-slate-950 disabled:cursor-not-allowed disabled:opacity-50"
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
              : "Preview Import"}
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
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="text-sm text-slate-400">
                Total Rows
              </p>

              <p className="mt-1 text-2xl font-bold text-white">
                {preview.totalRows}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="text-sm text-slate-400">
                Valid
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-400">
                {preview.validRows}
              </p>
            </div>

            <div className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <p className="text-sm text-slate-400">
                Needs Attention
              </p>

              <p className="mt-1 text-2xl font-bold text-red-400">
                {preview.invalidRows}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-900 text-slate-400">
                <tr>
                  <th className="px-4 py-3 text-left">
                    Row
                  </th>

                  <th className="px-4 py-3 text-left">
                    Player
                  </th>

                  <th className="px-4 py-3 text-left">
                    Fantasy Team
                  </th>

                  <th className="px-4 py-3 text-right">
                    Year 1
                  </th>

                  <th className="px-4 py-3 text-center">
                    Years
                  </th>

                  <th className="px-4 py-3 text-right">
                    Total Value
                  </th>

                  <th className="px-4 py-3 text-left">
                    Result
                  </th>
                </tr>
              </thead>

              <tbody>
                {preview.rows.map((previewRow) => (
                  <tr
                    key={previewRow.row.rowNumber}
                    className="border-t border-slate-800 align-top"
                  >
                    <td className="px-4 py-3 text-slate-400">
                      {previewRow.row.rowNumber}
                    </td>

                    <td className="px-4 py-3 text-white">
                      {previewRow.playerName ??
                        previewRow.row.playerName}
                    </td>

                    <td className="px-4 py-3 text-slate-300">
                      {previewRow.teamName ??
                        previewRow.row.fantasyTeam}
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
                        ? formatCurrency(
                            previewRow.totalValue
                          )
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      {previewRow.isValid ? (
                        <span className="rounded-full bg-emerald-950 px-2 py-1 text-xs font-medium text-emerald-300">
                          Ready
                        </span>
                      ) : (
                        <div className="space-y-1">
                          {previewRow.errors.map(
                            (rowError) => (
                              <p
                                key={rowError}
                                className="text-xs text-red-300"
                              >
                                {rowError}
                              </p>
                            )
                          )}
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
                ? "Importing..."
                : `Import ${preview.validRows} Valid Contract${
                    preview.validRows === 1 ? "" : "s"
                  }`}
            </button>

            <p className="text-xs text-slate-500">
              Invalid rows will be skipped.
            </p>
          </div>

          {importResult ? (
            <div
              className={`rounded-lg border p-4 ${
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
                Import Complete
              </h3>

              <div className="mt-2 space-y-1 text-sm text-white">
                <p>
                  Contracts created: {importResult.created}
                </p>

                <p>
                  Failed: {importResult.failed}
                </p>
              </div>

              {importResult.errors.length > 0 ? (
                <div className="mt-4">
                  <p className="text-sm font-medium text-red-300">
                    Errors
                  </p>

                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-red-200">
                    {importResult.errors.map(
                      (importError, index) => (
                        <li
                          key={`${importError}-${index}`}
                        >
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
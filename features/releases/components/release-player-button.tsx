"use client";

import { useState } from "react";

import { getReleasePreview } from "@/features/releases/actions/get-release-preview";
import { createPlayerRelease } from "@/features/releases/actions/create-player-release";

import type { ReleasePreviewDTO } from "@/features/releases/dto/release-preview-dto";

type ReleasePlayerButtonProps = {
  leagueId: string;
  contractId: string;
  playerName: string;
};

export function ReleasePlayerButton({
  leagueId,
  contractId,
  playerName,
}: ReleasePlayerButtonProps) {
  const [preview, setPreview] =
    useState<ReleasePreviewDTO | null>(null);

  const [isLoading, setIsLoading] =
    useState(false);

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  async function handlePreview() {
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result =
        await getReleasePreview({
          leagueId,
          contractId,
        });

      setPreview(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to calculate release impact.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmRelease() {
    if (!preview) {
      return;
    }

    const confirmed =
      window.confirm(
        `Release ${playerName}? This will create a pending release transaction with $${preview.totalDeadCap} in total dead cap.`,
      );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result =
        await createPlayerRelease({
          leagueId,
          contractId,
        });

      setSuccessMessage(
        `${result.playerName} release submitted. Transaction is pending approval.`,
      );

      setPreview(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to submit player release.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!preview) {
    return (
      <div>
        <button
          type="button"
          onClick={handlePreview}
          disabled={isLoading}
          className="rounded-lg border border-red-900/70 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/30 disabled:opacity-50"
        >
          {isLoading
            ? "Calculating..."
            : "Release"}
        </button>

        {errorMessage ? (
          <p className="mt-2 text-sm text-red-400">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="mt-2 text-sm text-emerald-400">
            {successMessage}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-red-900/50 bg-red-950/10 p-4 text-left">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-red-400">
            Release Preview
          </p>

          <h3 className="mt-1 font-semibold text-white">
            Release {playerName}?
          </h3>
        </div>

        <button
          type="button"
          onClick={() =>
            setPreview(null)
          }
          disabled={isSubmitting}
          className="text-sm text-slate-400 hover:text-white disabled:opacity-50"
        >
          Cancel
        </button>
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-950 text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left">
                Season
              </th>

              <th className="px-3 py-2 text-right">
                Current Hit
              </th>

              <th className="px-3 py-2 text-right">
                Dead Cap
              </th>

              <th className="px-3 py-2 text-right">
                Savings
              </th>
            </tr>
          </thead>

          <tbody>
            {preview.years.map(
              (year) => (
                <tr
                  key={year.seasonId}
                  className="border-t border-slate-800"
                >
                  <td className="px-3 py-2 text-white">
                    {year.seasonName}
                  </td>

                  <td className="px-3 py-2 text-right text-slate-300">
                    ${year.currentCapHit}
                  </td>

                  <td className="px-3 py-2 text-right text-red-300">
                    ${year.deadCap}
                  </td>

                  <td className="px-3 py-2 text-right text-emerald-300">
                    ${year.capSavings}
                  </td>
                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <SummaryCard
          label="Remaining Cap"
          value={
            preview.totalRemainingCapHit
          }
        />

        <SummaryCard
          label="Dead Cap"
          value={
            preview.totalDeadCap
          }
        />

        <SummaryCard
          label="Cap Savings"
          value={
            preview.totalCapSavings
          }
        />
      </div>

      <p className="mt-4 text-xs text-slate-400">
        Releasing this player will terminate the active contract and convert remaining guaranteed money into dead-cap charges.
      </p>

      <button
        type="button"
        onClick={
          handleConfirmRelease
        }
        disabled={isSubmitting}
        className="mt-4 rounded-lg bg-red-700 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSubmitting
          ? "Submitting..."
          : "Confirm Release"}
      </button>

      {errorMessage ? (
        <p className="mt-3 text-sm text-red-400">
          {errorMessage}
        </p>
      ) : null}
    </div>
  );
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-white">
        ${value}
      </p>
    </div>
  );
}
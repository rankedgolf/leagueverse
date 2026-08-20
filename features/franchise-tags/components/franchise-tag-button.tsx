"use client";

import { useState } from "react";

import { getFranchiseTagPreview } from "@/features/franchise-tags/actions/get-franchise-tag-preview";
import { applyFranchiseTag } from "@/features/franchise-tags/actions/apply-franchise-tag";

import type { FranchiseTagPreviewDTO } from "@/features/franchise-tags/dto/franchise-tag-preview-dto";

type FranchiseTagButtonProps = {
  leagueId: string;
  contractId: string;
  playerName: string;
};

export function FranchiseTagButton({
  leagueId,
  contractId,
  playerName,
}: FranchiseTagButtonProps) {
  const [preview, setPreview] =
    useState<FranchiseTagPreviewDTO | null>(null);

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
        await getFranchiseTagPreview({
          leagueId,
          contractId,
        });

      setPreview(result);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to calculate franchise tag.",
      );
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirmTag() {
    if (!preview) {
      return;
    }

    const confirmed =
      window.confirm(
        `Apply the franchise tag to ${playerName} for ${preview.tagSeasonName} at $${preview.tagCapHit}?`,
      );

    if (!confirmed) {
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const result =
        await applyFranchiseTag({
          leagueId,
          contractId,
        });

      setSuccessMessage(
        `${result.playerName} has been franchise tagged for ${result.tagSeasonName} at $${result.tagCapHit}.`,
      );

      setPreview(null);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to apply franchise tag.",
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
          className="rounded-lg border border-violet-800 px-3 py-2 text-sm font-semibold text-violet-300 hover:bg-violet-950/30 disabled:opacity-50"
        >
          {isLoading
            ? "Calculating..."
            : "Franchise Tag"}
        </button>

        {errorMessage ? (
          <p className="mt-2 text-xs text-red-400">
            {errorMessage}
          </p>
        ) : null}

        {successMessage ? (
          <p className="mt-2 text-xs text-emerald-400">
            {successMessage}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="mt-3 rounded-xl border border-violet-900/50 bg-violet-950/10 p-4 text-left">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-400">
            Franchise Tag Preview
          </p>

          <h3 className="mt-1 font-semibold text-white">
            Tag {playerName}?
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

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <InfoCard
          label="Previous Cap Hit"
          value={`$${preview.previousCapHit}`}
        />

        <InfoCard
          label="Tag Salary"
          value={`$${preview.tagCapHit}`}
        />

        <InfoCard
          label="Tag Premium"
          value={`+$${preview.tagPremium}`}
        />

        <InfoCard
          label="Tag Season"
          value={preview.tagSeasonName}
        />
      </div>

      {preview.tagAvailable ? (
        <>
          <p className="mt-4 text-xs text-slate-400">
            Franchise tag salary is 120% of the player's final contract-year cap hit. The tag lasts one season, and a player cannot be franchise tagged in consecutive seasons.
          </p>

          <button
            type="button"
            onClick={handleConfirmTag}
            disabled={isSubmitting}
            className="mt-4 rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting
              ? "Applying..."
              : "Confirm Franchise Tag"}
          </button>
        </>
      ) : (
        <p className="mt-4 text-sm text-red-400">
          {preview.unavailableReason}
        </p>
      )}

      {errorMessage ? (
        <p className="mt-3 text-xs text-red-400">
          {errorMessage}
        </p>
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
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
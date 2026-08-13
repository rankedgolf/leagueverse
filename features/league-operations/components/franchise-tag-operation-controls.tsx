"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { upsertLeagueOperationPeriod } from "@/features/league-operations/actions/upsert-league-operation-period";

type FranchiseTagOperationControlsProps = {
  leagueId: string;
  seasonId: string;

  period: {
    status: string;
    opensAt: string | null;
    closesAt: string | null;
  } | null;
};

export function FranchiseTagOperationControls({
  leagueId,
  seasonId,
  period,
}: FranchiseTagOperationControlsProps) {
  const router =
    useRouter();

  const [opensAt, setOpensAt] =
    useState(
      toLocalInputValue(
        period?.opensAt ?? null,
      ),
    );

  const [closesAt, setClosesAt] =
    useState(
      toLocalInputValue(
        period?.closesAt ?? null,
      ),
    );

  const [isWorking, setIsWorking] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  async function runAction(
    action:
      | "save"
      | "open"
      | "close",
  ) {
    setIsWorking(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      await upsertLeagueOperationPeriod({
        leagueId,
        seasonId,
        phase:
          "franchise_tag",
        action,

        opensAt:
          opensAt
            ? new Date(
                opensAt,
              ).toISOString()
            : null,

        closesAt:
          closesAt
            ? new Date(
                closesAt,
              ).toISOString()
            : null,
      });

      setMessage(
        action === "save"
          ? "Franchise Tag window saved."
          : action === "open"
            ? "Franchise Tag window opened."
            : "Franchise Tag window closed.",
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update Franchise Tag window.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  const isOpen =
    period?.status ===
    "open";

  return (
    <div className="mt-5 border-t border-slate-800 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Commissioner Controls
      </p>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="text-sm text-slate-300">
          Opens
          <input
            type="datetime-local"
            value={opensAt}
            onChange={(event) =>
              setOpensAt(
                event.target.value,
              )
            }
            disabled={isWorking}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </label>

        <label className="text-sm text-slate-300">
          Closes
          <input
            type="datetime-local"
            value={closesAt}
            onChange={(event) =>
              setClosesAt(
                event.target.value,
              )
            }
            disabled={isWorking}
            className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() =>
            runAction("save")
          }
          disabled={isWorking}
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
        >
          Save Window
        </button>

        {!isOpen ? (
          <button
            type="button"
            onClick={() =>
              runAction("open")
            }
            disabled={isWorking}
            className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:opacity-50"
          >
            Open Tag Window
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              runAction("close")
            }
            disabled={isWorking}
            className="rounded-lg bg-red-700 px-3 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50"
          >
            Close Tag Window
          </button>
        )}
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
  );
}

function toLocalInputValue(
  value: string | null,
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  const offset =
    date.getTimezoneOffset();

  const localDate =
    new Date(
      date.getTime() -
        offset *
          60 *
          1000,
    );

  return localDate
    .toISOString()
    .slice(0, 16);
}
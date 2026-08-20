"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { upsertRookieDraftOperation } from "@/features/league-operations/actions/upsert-rookie-draft-operation";

type RookieDraftOperationControlsProps = {
  leagueId: string;
  operationSeasonId: string;
  draftSeasonId: string;

  rounds: number;
  readyToOpen: boolean;

  period: {
    status: string;
    opensAt: string | null;
    closesAt: string | null;
  } | null;
};

export function RookieDraftOperationControls({
  leagueId,
  operationSeasonId,
  draftSeasonId,
  rounds,
  readyToOpen,
  period,
}: RookieDraftOperationControlsProps) {
  const router =
    useRouter();

  const [opensAt, setOpensAt] =
    useState(
      toLocalInputValue(
        period?.opensAt ??
          null,
      ),
    );

  const [closesAt, setClosesAt] =
    useState(
      toLocalInputValue(
        period?.closesAt ??
          null,
      ),
    );

  const [isWorking, setIsWorking] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(
      null,
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(
      null,
    );

  async function runAction(
    action:
      | "save"
      | "open"
      | "close",
  ) {
    if (
      action === "close" &&
      !window.confirm(
        "Close the Rookie Draft window?",
      )
    ) {
      return;
    }

    setIsWorking(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      await upsertRookieDraftOperation({
        leagueId,
        operationSeasonId,
        draftSeasonId,
        action,
        rounds,

        opensAt:
          opensAt
            ? new Date(
                opensAt,
              ).toISOString()
            : "",

        closesAt:
          closesAt
            ? new Date(
                closesAt,
              ).toISOString()
            : "",
      });

      setMessage(
        action === "save"
          ? "Rookie Draft window saved."
          : action === "open"
            ? "Rookie Draft window opened."
            : "Rookie Draft window closed.",
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update Rookie Draft.",
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
        Rookie Draft Window
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
          className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300"
        >
          Save Window
        </button>

        {!isOpen ? (
          <button
            type="button"
            onClick={() =>
              runAction("open")
            }
            disabled={
              isWorking ||
              !readyToOpen
            }
            className="rounded-lg bg-indigo-700 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            Open Rookie Draft
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              runAction("close")
            }
            disabled={isWorking}
            className="rounded-lg border border-red-800 px-3 py-2 text-sm font-semibold text-red-300"
          >
            Close Rookie Draft
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

  return new Date(
    date.getTime() -
      offset * 60 * 1000,
  )
    .toISOString()
    .slice(0, 16);
}
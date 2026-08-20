"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { upsertFreeAgencyOperation } from "@/features/league-operations/actions/upsert-free-agency-operation";

import { CompleteFreeAgencyButton } from "@/features/free-agency/components/complete-free-agency-button";

type FreeAgencyOperationControlsProps = {
  leagueId: string;
  seasonId: string;

  expirationCompleted: boolean;

  freeAgencyPeriodId:
    | string
    | null;

  period: {
    status: string;
    opensAt: string | null;
    closesAt: string | null;
  } | null;
};

export function FreeAgencyOperationControls({
  leagueId,
  seasonId,
  expirationCompleted,
  freeAgencyPeriodId,
  period,
}: FreeAgencyOperationControlsProps) {
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

  const [
    errorMessage,
    setErrorMessage,
  ] =
    useState<string | null>(
      null,
    );

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
      await upsertFreeAgencyOperation({
        leagueId,
        seasonId,
        action,

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
          ? "Free Agency window saved."
          : action === "open"
            ? "Free Agency opened."
            : "Free Agency closed.",
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update Free Agency.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  const isOpen =
    period?.status ===
    "open";

  const isClosed =
    period?.status ===
    "closed";

  const isCompleted =
    period?.status ===
    "completed";

  return (
    <div className="mt-5 border-t border-slate-800 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Commissioner Controls
      </p>

      <div className="mt-3 rounded-lg border border-slate-800 bg-slate-950 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Prerequisite
        </p>

        <p
          className={`mt-1 text-sm font-semibold ${
            expirationCompleted
              ? "text-emerald-300"
              : "text-amber-300"
          }`}
        >
          {expirationCompleted
            ? "✓ Contract Expirations Complete"
            : "Contract Expirations Must Be Completed"}
        </p>
      </div>

      {!isCompleted ? (
        <>
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
                disabled={
                  isWorking ||
                  isOpen ||
                  isClosed
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
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
                disabled={
                  isWorking ||
                  isOpen ||
                  isClosed
                }
                className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {!isOpen &&
            !isClosed ? (
              <>
                <button
                  type="button"
                  onClick={() =>
                    runAction(
                      "save",
                    )
                  }
                  disabled={
                    isWorking
                  }
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Save Window
                </button>

                <button
                  type="button"
                  onClick={() =>
                    runAction(
                      "open",
                    )
                  }
                  disabled={
                    isWorking ||
                    !expirationCompleted
                  }
                  className="rounded-lg bg-emerald-700 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Open Free Agency
                </button>
              </>
            ) : null}

            {isOpen ? (
              <>
                <span className="rounded-lg border border-emerald-800 bg-emerald-950/30 px-3 py-2 text-sm font-semibold text-emerald-300">
                  Free Agency Open
                </span>

                <button
                  type="button"
                  onClick={() => {
                    const confirmed =
                      window.confirm(
                        "Close Free Agency? Owners will no longer be able to submit or edit offers.",
                      );

                    if (
                      confirmed
                    ) {
                      void runAction(
                        "close",
                      );
                    }
                  }}
                  disabled={
                    isWorking
                  }
                  className="rounded-lg border border-red-800 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/30 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isWorking
                    ? "Closing..."
                    : "Close Free Agency"}
                </button>
              </>
            ) : null}

            {isClosed ? (
              <span className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm font-semibold text-slate-300">
                Free Agency Closed
              </span>
            ) : null}
          </div>

          {isClosed &&
          freeAgencyPeriodId ? (
            <div className="mt-4">
              <CompleteFreeAgencyButton
                leagueId={
                  leagueId
                }
                operationSeasonId={
                  seasonId
                }
                freeAgencyPeriodId={
                  freeAgencyPeriodId
                }
              />
            </div>
          ) : null}

          {isClosed &&
          !freeAgencyPeriodId ? (
            <p className="mt-3 text-sm text-amber-300">
              The Free Agency period could not be resolved. Completion is unavailable.
            </p>
          ) : null}
        </>
      ) : (
        <div className="mt-4 rounded-lg border border-emerald-800 bg-emerald-950/30 p-3">
          <p className="text-sm font-semibold text-emerald-300">
            ✓ Free Agency Complete
          </p>

          <p className="mt-1 text-xs text-slate-400">
            The Free Agency phase has been completed and Season Transition can proceed once the remaining offseason requirements are satisfied.
          </p>
        </div>
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
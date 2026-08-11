"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { processFreeAgencyNow } from "@/features/free-agency/actions/process-free-agency-now";
import { updateFreeAgencyPeriod } from "@/features/free-agency/actions/update-free-agency-period";

type FreeAgencyControlCenterProps = {
  leagueId: string;
  period: {
    id: string;
    name: string;
    status: string;
    opens_at: string;
    closes_at: string;
    decisions_begin_at: string | null;
    decisions_end_at: string | null;
    decision_frequency_hours: number | null;
    last_decision_at: string | null;
    next_decision_at: string | null;
  };
};

export function FreeAgencyControlCenter({
  leagueId,
  period,
}: FreeAgencyControlCenterProps) {
  const router = useRouter();

  const [isWorking, setIsWorking] =
    useState(false);

  const [message, setMessage] =
    useState<string | null>(null);

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const [frequencyHours, setFrequencyHours] =
    useState(
      String(
        period.decision_frequency_hours ??
          24,
      ),
    );

  async function runAction(
    action:
      | "pause"
      | "resume"
      | "close",
  ) {
    if (
      action === "close" &&
      !window.confirm(
        "Close this Free Agency period? Owners will no longer be able to submit offers.",
      )
    ) {
      return;
    }

    setIsWorking(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      await updateFreeAgencyPeriod({
        leagueId,
        periodId: period.id,
        action,
      });

      setMessage(
        action === "pause"
          ? "Free Agency paused."
          : action === "resume"
            ? "Free Agency resumed."
            : "Free Agency period closed.",
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

  async function handleProcess() {
    if (
      !window.confirm(
        "Process all eligible Free Agency decisions now?",
      )
    ) {
      return;
    }

    setIsWorking(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      const result =
        await processFreeAgencyNow({
          leagueId,
          periodId: period.id,
        });

      setMessage(
        `Processed ${result.decisionsCreated} decision${
          result.decisionsCreated === 1 ? "" : "s"
        }${
          result.failures.length > 0
            ? ` with ${result.failures.length} failure${
                result.failures.length === 1 ? "" : "s"
              }.`
            : "."
        }`,
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to process Free Agency.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  async function handleFrequencySave() {
    setIsWorking(true);
    setMessage(null);
    setErrorMessage(null);

    try {
      await updateFreeAgencyPeriod({
        leagueId,
        periodId: period.id,
        action: "frequency",
        frequencyHours:
          Number(frequencyHours),
      });

      setMessage(
        "Decision cadence updated.",
      );

      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to update the decision cadence.",
      );
    } finally {
      setIsWorking(false);
    }
  }

  const isOpen =
    period.status === "open";

  const isPaused =
    period.status === "paused";

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Commissioner Control Center
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-white">
              {period.name}
            </h2>

            <StatusBadge
              status={period.status}
            />
          </div>

          <p className="mt-2 text-sm text-slate-400">
            Manage the Free Agency window and automated player decision schedule.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {isOpen ? (
            <button
              type="button"
              onClick={() =>
                runAction("pause")
              }
              disabled={isWorking}
              className="rounded-lg border border-amber-700 px-3 py-2 text-sm font-semibold text-amber-300 hover:bg-amber-950/30 disabled:opacity-50"
            >
              Pause
            </button>
          ) : null}

          {isPaused ? (
            <button
              type="button"
              onClick={() =>
                runAction("resume")
              }
              disabled={isWorking}
              className="rounded-lg border border-emerald-700 px-3 py-2 text-sm font-semibold text-emerald-300 hover:bg-emerald-950/30 disabled:opacity-50"
            >
              Resume
            </button>
          ) : null}

          {period.status !== "closed" ? (
            <button
              type="button"
              onClick={() =>
                runAction("close")
              }
              disabled={isWorking}
              className="rounded-lg border border-red-900/70 px-3 py-2 text-sm font-semibold text-red-300 hover:bg-red-950/30 disabled:opacity-50"
            >
              Close Period
            </button>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <InfoCard
          label="Offer Window"
          value={`${formatDateTime(period.opens_at)} → ${formatDateTime(period.closes_at)}`}
        />

        <InfoCard
          label="Decision Window"
          value={`${formatDateTime(period.decisions_begin_at)} → ${formatDateTime(period.decisions_end_at)}`}
        />

        <InfoCard
          label="Next Decision"
          value={formatDateTime(
            period.next_decision_at,
          )}
        />

        <InfoCard
          label="Last Processed"
          value={formatDateTime(
            period.last_decision_at,
          )}
        />

        <div className="rounded-lg border border-slate-800 bg-slate-950 p-3 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Decision Cadence
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <select
              value={frequencyHours}
              onChange={(event) =>
                setFrequencyHours(
                  event.target.value,
                )
              }
              disabled={isWorking}
              className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white"
            >
              <option value="12">
                Every 12 hours
              </option>
              <option value="24">
                Every 24 hours
              </option>
              <option value="48">
                Every 48 hours
              </option>
              <option value="72">
                Every 72 hours
              </option>
              <option value="168">
                Weekly
              </option>
            </select>

            <button
              type="button"
              onClick={
                handleFrequencySave
              }
              disabled={isWorking}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Save Cadence
            </button>
          </div>
        </div>
      </div>

      <div className="mt-5 border-t border-slate-800 pt-4">
        <button
          type="button"
          onClick={handleProcess}
          disabled={
            isWorking ||
            !isOpen
          }
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isWorking
            ? "Working..."
            : "Process Decisions Now"}
        </button>

        {!isOpen ? (
          <p className="mt-2 text-xs text-slate-500">
            Decision processing is available only while the period is open.
          </p>
        ) : null}

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
    </section>
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
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-sm font-medium text-white">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const className =
    status === "open"
      ? "border-emerald-800 bg-emerald-950/40 text-emerald-300"
      : status === "paused"
        ? "border-amber-800 bg-amber-950/40 text-amber-300"
        : status === "closed"
          ? "border-red-900 bg-red-950/40 text-red-300"
          : "border-slate-700 bg-slate-950 text-slate-300";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}
    >
      {status}
    </span>
  );
}

function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}
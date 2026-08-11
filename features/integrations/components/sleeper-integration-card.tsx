"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  connectSleeperLeague,
  type ConnectSleeperLeagueResult,
} from "@/features/integrations/actions/connect-sleeper-league";
import type { LeagueIntegrationDTO } from "@/features/integrations/dto/integration-dto";

type SleeperIntegrationCardProps = {
  leagueId: string;
  existingIntegration: LeagueIntegrationDTO | null;
};

type SleeperAuctionPickSample = {
  playerId: string;
  playerName: string;
  position: string | null;
  nflTeam: string | null;
  rosterId: string;
  amount: number | null;
  pickNumber: number;
};

type SleeperLeaguePreview = {
  externalLeagueId: string;
  leagueName: string;
  season: string;
  status: string;
  sport: string;
  totalRosters: number;
  userCount: number;
  rosterCount: number;
  playerCount: number;
  draftCount: number;
  latestDraftId: string | null;
  latestDraftType: string | null;
  latestDraftStatus: string | null;
  draftPickCount: number;
  auctionAmountCount: number;
  auctionTotalSpent: number;
  auctionPickSamples: SleeperAuctionPickSample[];
};

type PreviewResponse = {
  data?: SleeperLeaguePreview;
  error?: string;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function formatLabel(value: string | null): string {
  if (!value) {
    return "Unavailable";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatDateTime(value: string | null): string {
  if (!value) {
    return "Never";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function SleeperIntegrationCard({
  leagueId,
  existingIntegration,
}: SleeperIntegrationCardProps) {
  const router = useRouter();

  const [leagueUrlOrId, setLeagueUrlOrId] = useState(
    existingIntegration?.externalLeagueId ?? "",
  );

  const [preview, setPreview] =
    useState<SleeperLeaguePreview | null>(null);

  const [isPreviewing, setIsPreviewing] =
    useState(false);

  const [isConnecting, setIsConnecting] =
    useState(false);

  const [connectResult, setConnectResult] =
    useState<ConnectSleeperLeagueResult | null>(
      null,
    );

  const [errorMessage, setErrorMessage] =
    useState<string | null>(null);

  const isAlreadyConnected =
    existingIntegration?.isConnected === true;

  const isConnected =
    isAlreadyConnected ||
    connectResult?.success === true;

  const isBusy = isPreviewing || isConnecting;

  async function handlePreview() {
    const trimmedValue = leagueUrlOrId.trim();

    if (!trimmedValue) {
      setErrorMessage(
        "Enter a Sleeper league URL or league ID.",
      );

      return;
    }

    setIsPreviewing(true);
    setPreview(null);
    setConnectResult(null);
    setErrorMessage(null);

    try {
      const response = await fetch(
        "/api/integrations/sleeper/preview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            leagueUrlOrId: trimmedValue,
          }),
        },
      );

      const result =
        (await response.json()) as PreviewResponse;

      if (!response.ok || !result.data) {
        throw new Error(
          result.error ??
            "Unable to preview the Sleeper league.",
        );
      }

      setPreview(result.data);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to preview the Sleeper league.",
      );
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleConnect() {
    if (!preview || isConnected) {
      return;
    }

    setIsConnecting(true);
    setConnectResult(null);
    setErrorMessage(null);

    try {
      const result = await connectSleeperLeague({
        leagueId,
        leagueUrlOrId,
      });

      setConnectResult(result);
      router.refresh();
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Unable to connect the Sleeper league.",
      );
    } finally {
      setIsConnecting(false);
    }
  }

  return (
    <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold text-white">
              Sleeper
            </h2>

            <span
              className={`rounded-full border px-2.5 py-1 text-xs font-medium ${
                isConnected
                  ? "border-emerald-900/60 bg-emerald-950/40 text-emerald-300"
                  : "border-slate-700 bg-slate-950 text-slate-300"
              }`}
            >
              {isConnected
                ? "Connected"
                : "Available"}
            </span>
          </div>

          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            Connect a Sleeper league to import teams,
            owners, rosters, completed draft results,
            and auction salaries.
          </p>
        </div>

        <p className="text-xs text-slate-500">
          LeagueVerse league: {leagueId}
        </p>
      </div>

      {isAlreadyConnected && existingIntegration ? (
        <div className="mt-5 rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                Sleeper Connected
              </p>

              <p className="mt-2 text-sm font-medium text-white">
                This LeagueVerse league is linked to
                Sleeper.
              </p>
            </div>

            <span className="rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-300">
              Active
            </span>
          </div>

          <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
            <ConnectedDetail
              label="Sleeper League ID"
              value={
                existingIntegration.externalLeagueId
              }
            />

            <ConnectedDetail
              label="Sleeper Draft ID"
              value={
                existingIntegration.externalDraftId ??
                "Unavailable"
              }
            />

            <ConnectedDetail
              label="Last Sync"
              value={formatDateTime(
                existingIntegration.lastSyncAt,
              )}
            />

            <ConnectedDetail
              label="Connected"
              value={formatDateTime(
                existingIntegration.createdAt,
              )}
            />
          </dl>

          <div className="mt-6 flex flex-wrap gap-3">
            <a
              href={`/leagues/${leagueId}/integrations/sleeper/import`}
              className="inline-flex items-center rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
            >
              Import League
            </a>

            <a
              href={`/leagues/${leagueId}/integrations/sleeper/sync`}
              className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Preview Roster Sync
            </a>

            <button
              type="button"
              disabled
              className="inline-flex items-center rounded-lg border border-slate-700 bg-slate-900 px-4 py-2 text-sm font-semibold text-slate-500"
            >
              Sync League (Coming Soon)
            </button>
          </div>
        </div>
      ) : null}

      {!isConnected ? (
        <>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <div className="flex-1">
          <label
            htmlFor="sleeper-league-url"
            className="mb-2 block text-sm font-medium text-slate-300"
          >
            Sleeper league URL or ID
          </label>

          <input
            id="sleeper-league-url"
            type="text"
            value={leagueUrlOrId}
            onChange={(event) => {
              setLeagueUrlOrId(
                event.target.value,
              );
              setPreview(null);
              setConnectResult(null);
              setErrorMessage(null);
            }}
            placeholder="https://sleeper.com/leagues/..."
            disabled={isBusy}
            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none placeholder:text-slate-600 focus:border-slate-500 disabled:cursor-not-allowed disabled:opacity-50"
          />
        </div>

        <div className="sm:self-end">
          <button
            type="button"
            onClick={handlePreview}
            disabled={
              isBusy ||
              !leagueUrlOrId.trim()
            }
            className="w-full rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isPreviewing
              ? "Loading Preview..."
              : isAlreadyConnected
                ? "Refresh Preview"
                : "Preview League"}
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="mt-4 rounded-lg border border-red-900/60 bg-red-950/40 p-3 text-sm text-red-300">
          {errorMessage}
        </div>
      ) : null}

      {connectResult?.success ? (
        <div className="mt-4 rounded-lg border border-emerald-900/60 bg-emerald-950/40 p-4">
          <p className="font-medium text-emerald-300">
            Sleeper Connected
          </p>

          <p className="mt-1 text-sm text-slate-300">
            {connectResult.message}
          </p>

          {connectResult.externalLeagueId ? (
            <p className="mt-2 text-xs text-slate-500">
              Sleeper league ID:{" "}
              {connectResult.externalLeagueId}
            </p>
          ) : null}
        </div>
      ) : null}

      {preview ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
                  Sleeper League Found
                </p>

                <h3 className="mt-2 text-xl font-bold text-white">
                  {preview.leagueName}
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  {formatLabel(preview.sport)} ·{" "}
                  {preview.season} ·{" "}
                  {formatLabel(preview.status)}
                </p>
              </div>

              <span className="rounded-full border border-emerald-800 bg-emerald-950 px-3 py-1 text-xs font-medium text-emerald-300">
                {isConnected
                  ? "Connected"
                  : "Ready to Connect"}
              </span>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <PreviewStat
                label="Teams"
                value={preview.rosterCount}
              />

              <PreviewStat
                label="Owners"
                value={preview.userCount}
              />

              <PreviewStat
                label="Rostered Players"
                value={preview.playerCount}
              />

              <PreviewStat
                label="Draft Picks"
                value={preview.draftPickCount}
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <h3 className="font-semibold text-white">
                Draft Details
              </h3>

              <dl className="mt-4 space-y-3 text-sm">
                <DetailRow
                  label="Draft Type"
                  value={formatLabel(
                    preview.latestDraftType,
                  )}
                />

                <DetailRow
                  label="Draft Status"
                  value={formatLabel(
                    preview.latestDraftStatus,
                  )}
                />

                <DetailRow
                  label="Draft ID"
                  value={
                    preview.latestDraftId ??
                    "Unavailable"
                  }
                />
              </dl>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
              <h3 className="font-semibold text-white">
                Auction Validation
              </h3>

              <dl className="mt-4 space-y-3 text-sm">
                <DetailRow
                  label="Prices Found"
                  value={`${preview.auctionAmountCount} of ${preview.draftPickCount}`}
                />

                <DetailRow
                  label="Total Spent"
                  value={formatCurrency(
                    preview.auctionTotalSpent,
                  )}
                />

                <DetailRow
                  label="Validation"
                  value={
                    preview.auctionAmountCount ===
                    preview.draftPickCount
                      ? "Complete"
                      : "Needs Review"
                  }
                  valueClassName={
                    preview.auctionAmountCount ===
                    preview.draftPickCount
                      ? "text-emerald-400"
                      : "text-amber-400"
                  }
                />
              </dl>
            </div>
          </div>

          <div className="rounded-xl border border-slate-800 bg-slate-950 p-5">
            <div>
              <h3 className="font-semibold text-white">
                Auction Sample
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                A sample of the completed draft results
                found by LeagueVerse.
              </p>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-slate-400">
                  <tr>
                    <th className="px-3 py-2 text-left">
                      Pick
                    </th>

                    <th className="px-3 py-2 text-left">
                      Player
                    </th>

                    <th className="px-3 py-2 text-center">
                      Position
                    </th>

                    <th className="px-3 py-2 text-center">
                      NFL Team
                    </th>

                    <th className="px-3 py-2 text-center">
                      Roster
                    </th>

                    <th className="px-3 py-2 text-right">
                      Salary
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {preview.auctionPickSamples.map(
                    (pick) => (
                      <tr
                        key={`${pick.playerId}-${pick.pickNumber}`}
                        className="border-t border-slate-800"
                      >
                        <td className="px-3 py-3 text-slate-400">
                          {pick.pickNumber}
                        </td>

                        <td className="px-3 py-3 font-medium text-white">
                          {pick.playerName}
                        </td>

                        <td className="px-3 py-3 text-center text-slate-300">
                          {pick.position ?? "—"}
                        </td>

                        <td className="px-3 py-3 text-center text-slate-300">
                          {pick.nflTeam ?? "—"}
                        </td>

                        <td className="px-3 py-3 text-center text-slate-300">
                          {pick.rosterId}
                        </td>

                        <td className="px-3 py-3 text-right font-medium text-emerald-400">
                          {pick.amount === null
                            ? "—"
                            : formatCurrency(
                                pick.amount,
                              )}
                        </td>
                      </tr>
                    ),
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex flex-col gap-3 rounded-xl border border-slate-800 bg-slate-950 p-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-medium text-white">
                {isConnected
                  ? `${preview.leagueName} is connected`
                  : `Ready to connect ${preview.leagueName}`}
              </p>

              <p className="mt-1 text-sm text-slate-400">
                {isConnected
                  ? "The Sleeper league and draft IDs are saved in LeagueVerse."
                  : "Connecting saves the Sleeper league and draft IDs. No teams or players will be imported yet."}
              </p>
            </div>

            <button
              type="button"
              onClick={handleConnect}
              disabled={
                isBusy ||
                isConnected
              }
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isConnecting
                ? "Connecting..."
                : isConnected
                  ? "Sleeper Connected"
                  : "Connect Sleeper League"}
            </button>
          </div>
        </div>
      ) : null}
        </>
      ) : null}
    </section>
  );
}

type PreviewStatProps = {
  label: string;
  value: number;
};

function PreviewStat({
  label,
  value,
}: PreviewStatProps) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950/70 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-2xl font-bold text-white">
        {value}
      </p>
    </div>
  );
}

type DetailRowProps = {
  label: string;
  value: string;
  valueClassName?: string;
};

function DetailRow({
  label,
  value,
  valueClassName = "text-white",
}: DetailRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="text-slate-500">
        {label}
      </dt>

      <dd
        className={`max-w-[65%] break-all text-right font-medium ${valueClassName}`}
      >
        {value}
      </dd>
    </div>
  );
}

type ConnectedDetailProps = {
  label: string;
  value: string;
};

function ConnectedDetail({
  label,
  value,
}: ConnectedDetailProps) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500">
        {label}
      </dt>

      <dd className="mt-2 break-all font-medium text-white">
        {value}
      </dd>
    </div>
  );
}
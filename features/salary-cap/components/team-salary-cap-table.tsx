"use client";

import { Fragment, useState } from "react";

import type {
  TeamSalaryCapDTO,
  TeamSeasonCapDTO,
} from "@/features/salary-cap/dto/salary-cap-dto";

type TeamSalaryCapTableProps = {
  teams: TeamSalaryCapDTO[];
  activeSeasonId: string;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

function getSeasonNames(teams: TeamSalaryCapDTO[]): string[] {
  const seasons = new Map<string, number>();

  for (const team of teams) {
    for (const season of team.futureCommitments) {
      seasons.set(season.seasonName, season.seasonYear);
    }
  }

  return Array.from(seasons.entries())
    .sort((a, b) => a[1] - b[1])
    .map(([seasonName]) => seasonName);
}

function getHealthClasses(
  status: TeamSalaryCapDTO["capHealth"]
): string {
  switch (status) {
    case "over_cap":
      return "border-red-900/60 bg-red-950/40 text-red-300";
    case "watch":
      return "border-amber-900/60 bg-amber-950/40 text-amber-300";
    default:
      return "border-emerald-900/60 bg-emerald-950/40 text-emerald-300";
  }
}

function getUsageBarClasses(percentage: number): string {
  if (percentage > 100) return "bg-red-500";
  if (percentage >= 85) return "bg-amber-500";
  return "bg-emerald-500";
}

function getUsageTextClasses(percentage: number): string {
  if (percentage > 100) return "text-red-400";
  if (percentage >= 85) return "text-amber-400";
  return "text-emerald-400";
}

function findCommitment(
  commitments: TeamSeasonCapDTO[],
  seasonName: string
) {
  return commitments.find(
    (commitment) => commitment.seasonName === seasonName
  );
}

export function TeamSalaryCapTable({
  teams,
  activeSeasonId,
}: TeamSalaryCapTableProps) {
  const [expandedTeamIds, setExpandedTeamIds] =
    useState<Set<string>>(new Set());

  const seasonNames = getSeasonNames(teams);

  function toggleTeam(teamId: string) {
    setExpandedTeamIds((current) => {
      const next = new Set(current);

      if (next.has(teamId)) {
        next.delete(teamId);
      } else {
        next.add(teamId);
      }

      return next;
    });
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-800 bg-slate-950">
      <table className="w-full table-fixed text-sm">
        <thead className="bg-slate-900 text-slate-400">
          <tr>
            <th className="w-10 px-2 py-3 text-left">
              <span className="sr-only">Expand</span>
            </th>

            <th className="w-[16%] px-3 py-3 text-left">Team</th>

            <th className="w-[25%] px-3 py-3 text-left">
              Current Cap
            </th>

            <th className="w-[16%] px-3 py-3 text-left">
              Contract Capacity
            </th>

            <th className="w-[18%] px-3 py-3 text-left">
              Future Outlook
            </th>

            <th className="w-[25%] px-3 py-3 text-left">
              Cap Timeline
            </th>
          </tr>
        </thead>

        <tbody>
          {teams.map((team) => {
            const isExpanded =
              expandedTeamIds.has(team.teamId);

            const displayedUsage = Math.min(
              Math.max(team.currentUsagePercentage, 0),
              100
            );

            return (
              <Fragment key={team.teamId}>
                <tr className="border-t border-slate-800 align-middle">
                  <td className="px-2 py-4">
                    <button
                      type="button"
                      onClick={() => toggleTeam(team.teamId)}
                      aria-expanded={isExpanded}
                      aria-label={
                        isExpanded
                          ? `Collapse ${team.teamName}`
                          : `Expand ${team.teamName}`
                      }
                      className="flex h-7 w-7 items-center justify-center rounded-md border border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white"
                    >
                      <span
                        className={`transition-transform ${
                          isExpanded ? "rotate-90" : ""
                        }`}
                      >
                        ›
                      </span>
                    </button>
                  </td>

                  <td className="px-3 py-4">
                    <p className="font-medium text-white">
                      {team.teamName}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {team.playerCount} players
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      Cap limit: {formatCurrency(team.salaryCap)}
                    </p>
                  </td>

                  <td className="px-3 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="font-medium text-white">
                        {formatCurrency(team.currentCommitted)}
                      </span>

                      <span className="text-xs text-slate-400">
                        {team.currentUsagePercentage.toFixed(1)}%
                      </span>
                    </div>

                    <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className={`h-full rounded-full ${getUsageBarClasses(
                          team.currentUsagePercentage
                        )}`}
                        style={{ width: `${displayedUsage}%` }}
                      />
                    </div>

                    <div className="mt-2 flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-500">
                        {formatCurrency(team.currentCommitted)} used
                      </span>

                      <span
                        className={
                          team.currentCapSpace < 0
                            ? "font-medium text-red-400"
                            : "font-medium text-emerald-400"
                        }
                      >
                        {formatCurrency(team.currentCapSpace)} free
                      </span>
                    </div>
                  </td>

                  <td className="px-3 py-4">
                    <p className="font-medium text-white">
                      {Math.max(
                        team.maximumContractYears -
                          team.contractYearsUsed,
                        0
                      )}{" "}
                      years available
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {team.contractYearsUsed} of{" "}
                      {team.maximumContractYears} committed
                    </p>
                  </td>

                  <td className="px-3 py-4">
                    <span
                      className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${getHealthClasses(
                        team.capHealth
                      )}`}
                    >
                      {team.capHealthMessage}
                    </span>
                  </td>

                  <td className="px-3 py-4">
                    <div className="space-y-2">
                      {team.futureCommitments.map((season) => {
                        const displayedSeasonUsage = Math.min(
                          Math.max(season.usagePercentage, 0),
                          100
                        );

                        return (
                          <div
                            key={season.seasonId}
                            className="grid grid-cols-[34px_1fr_42px] items-center gap-1.5"
                          >
                            <span className="text-xs font-medium text-slate-400">
                              {season.seasonYear}
                            </span>

                            <div>
                              <div className="h-1.5 overflow-hidden rounded-full bg-slate-800">
                                <div
                                  className={`h-full rounded-full ${getUsageBarClasses(
                                    season.usagePercentage
                                  )}`}
                                  style={{
                                    width: `${displayedSeasonUsage}%`,
                                  }}
                                />
                              </div>

                              <p className="mt-1 truncate text-[10px] text-slate-500">
                                {formatCurrency(season.committed)} used
                              </p>
                            </div>

                            <span
                              className={`text-right text-xs font-semibold ${getUsageTextClasses(
                                season.usagePercentage
                              )}`}
                            >
                              {season.usagePercentage.toFixed(1)}%
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </td>
                </tr>

                {isExpanded ? (
                  <tr className="border-t border-slate-800 bg-slate-900/40">
                    <td colSpan={6} className="px-5 py-5">
                      <div>
                        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-400">
                          Active Contracts
                        </h3>

                        {team.players.length === 0 ? (
                          <p className="mt-3 text-sm text-slate-500">
                            No active contracts for this team.
                          </p>
                        ) : (
                          <div className="mt-3 overflow-x-auto rounded-lg border border-slate-800 bg-slate-950">
                            <table className="w-full min-w-[900px] text-sm">
                              <thead className="bg-slate-900 text-slate-400">
                                <tr>
                                  <th className="px-4 py-3 text-left">
                                    Player
                                  </th>

                                  <th className="px-4 py-3 text-right">
                                    Current Cap Hit
                                  </th>

                                  <th className="px-4 py-3 text-right">
                                    Total Value
                                  </th>

                                  <th className="px-4 py-3 text-center">
                                    Contract
                                  </th>

                                  {seasonNames.map((seasonName) => (
                                    <th
                                      key={`${team.teamId}-detail-${seasonName}`}
                                      className="px-4 py-3 text-right"
                                    >
                                      {seasonName}
                                    </th>
                                  ))}
                                </tr>
                              </thead>

                              <tbody>
                                {team.players.map((player) => (
                                  <tr
                                    key={player.contractId}
                                    className="border-t border-slate-800"
                                  >
                                    <td className="px-4 py-3">
                                      <p className="font-medium text-white">
                                        {player.playerName}
                                      </p>

                                      <p className="mt-1 text-xs text-slate-500">
                                        {[
                                          player.position,
                                          player.proTeam,
                                        ]
                                          .filter(Boolean)
                                          .join(" · ") ||
                                          "Player details unavailable"}
                                      </p>
                                    </td>

                                    <td className="px-4 py-3 text-right font-medium text-white">
                                      {formatCurrency(
                                        player.currentCapHit
                                      )}
                                    </td>

                                    <td className="px-4 py-3 text-right text-slate-300">
                                      {formatCurrency(
                                        player.totalValue
                                      )}
                                    </td>

                                    <td className="px-4 py-3 text-center text-slate-300">
                                      <p>
                                        {player.contractYears}{" "}
                                        {player.contractYears === 1
                                          ? "year"
                                          : "years"}
                                      </p>

                                      <p className="mt-1 text-xs text-slate-500">
                                        Through {player.endSeasonName}
                                      </p>
                                    </td>

                                    {seasonNames.map((seasonName) => {
                                      const commitment =
                                        findCommitment(
                                          player.futureCommitments,
                                          seasonName
                                        );

                                      const isCurrent =
                                        commitment?.seasonId ===
                                        activeSeasonId;

                                      return (
                                        <td
                                          key={`${player.contractId}-${seasonName}`}
                                          className={`px-4 py-3 text-right ${
                                            isCurrent
                                              ? "font-medium text-white"
                                              : "text-slate-300"
                                          }`}
                                        >
                                          {formatCurrency(
                                            commitment?.committed ?? 0
                                          )}
                                        </td>
                                      );
                                    })}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
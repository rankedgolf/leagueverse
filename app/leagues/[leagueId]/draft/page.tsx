import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { DraftPickRepository } from "@/features/draft-picks/repositories/draft-pick-repository";
import { TeamRepository } from "@/features/teams/repositories/team-repository";

type DraftPageProps = {
  params: Promise<{
    leagueId: string;
  }>;

  searchParams: Promise<{
    year?: string;
    round?: string;
    team?: string;
  }>;
};

type SeasonRelation = {
  id: string;
  name: string;
  year: number;
};

type TeamRelation = {
  id: string;
  name: string;
};

type DraftPickView = {
  id: string;
  seasonId: string;
  seasonYear: number | null;
  round: number;
  pickNumber: number | null;
  originalTeamId: string;
  originalTeamName: string;
  currentTeamId: string;
  currentTeamName: string;
  status: string;
};

function unwrapRelation<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getRoundLabel(round: number): string {
  switch (round) {
    case 1:
      return "1st";
    case 2:
      return "2nd";
    case 3:
      return "3rd";
    default:
      return `${round}th`;
  }
}

export default async function DraftPage({
  params,
  searchParams,
}: DraftPageProps) {
  const { leagueId } = await params;
  const filters = await searchParams;

  const supabase = await createClient();

  const [
    draftPicks,
    teams,
    contractSettingsResult,
  ] = await Promise.all([
    DraftPickRepository.getByLeague(leagueId),
    TeamRepository.getByLeague(leagueId),

    supabase
      .from("league_contract_settings")
      .select(`
        rookie_draft_rounds
      `)
      .eq("league_id", leagueId)
      .maybeSingle(),
  ]);

  if (contractSettingsResult.error) {
    throw new Error(
      contractSettingsResult.error.message,
    );
  }

  const rookieDraftRounds =
    contractSettingsResult.data?.rookie_draft_rounds ?? 2;

  const picks: DraftPickView[] = draftPicks.map((row) => {
    const season = unwrapRelation(
      row.seasons as
        | SeasonRelation
        | SeasonRelation[]
        | null,
    );

    const originalTeam = unwrapRelation(
      row.original_team as
        | TeamRelation
        | TeamRelation[]
        | null,
    );

    const currentTeam = unwrapRelation(
      row.current_team as
        | TeamRelation
        | TeamRelation[]
        | null,
    );

    return {
      id: row.id,
      seasonId: row.season_id,
      seasonYear: season?.year ?? null,
      round: row.round,
      pickNumber: row.pick_number ?? null,
      originalTeamId: row.original_team_id,
      originalTeamName:
        originalTeam?.name ?? "Unknown Team",
      currentTeamId: row.current_team_id,
      currentTeamName:
        currentTeam?.name ?? "Unknown Team",
      status: row.status,
    };
  });

  const years = Array.from(
    new Set(
      picks
        .map((pick) => pick.seasonYear)
        .filter(
          (year): year is number =>
            year !== null,
        ),
    ),
  ).sort((a, b) => a - b);

  const rounds = Array.from(
    new Set(picks.map((pick) => pick.round)),
  ).sort((a, b) => a - b);

  const nextDraftYear = years[0] ?? null;

  const nextDraftPicks =
    nextDraftYear === null
      ? []
      : picks.filter(
          (pick) =>
            pick.seasonYear === nextDraftYear &&
            pick.status === "active",
        );

  const selectedYear = filters.year
    ? Number(filters.year)
    : null;

  const selectedRound = filters.round
    ? Number(filters.round)
    : null;

  const selectedTeam = filters.team ?? null;

  const filteredPicks = picks.filter((pick) => {
    if (
      selectedYear !== null &&
      pick.seasonYear !== selectedYear
    ) {
      return false;
    }

    if (
      selectedRound !== null &&
      pick.round !== selectedRound
    ) {
      return false;
    }

    if (
      selectedTeam &&
      pick.currentTeamId !== selectedTeam
    ) {
      return false;
    }

    return true;
  });

  const tradedPicks = picks
    .filter(
      (pick) =>
        pick.originalTeamId !==
        pick.currentTeamId,
    )
    .sort((a, b) => {
      const yearA = a.seasonYear ?? 9999;
      const yearB = b.seasonYear ?? 9999;

      if (yearA !== yearB) {
        return yearA - yearB;
      }

      if (a.round !== b.round) {
        return a.round - b.round;
      }

      return a.originalTeamName.localeCompare(
        b.originalTeamName,
      );
    });

  const activePickCount = picks.filter(
    (pick) => pick.status === "active",
  ).length;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-sm font-medium text-emerald-400">
            League Draft Center
          </p>

          <h1 className="mt-1 text-3xl font-bold text-white">
            Draft
          </h1>

          <p className="mt-2 max-w-3xl text-sm text-slate-400">
            Manage future draft capital, track traded picks, and prepare
            for upcoming rookie drafts.
          </p>
        </div>

        <Link
          href={`/leagues/${leagueId}/transactions/new-trade`}
          className="inline-flex h-fit rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-600"
        >
          Create Trade
        </Link>
      </div>

      <section className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400">
              Upcoming Rookie Draft
            </p>

            <h2 className="mt-2 text-2xl font-bold text-white">
              {nextDraftYear
                ? `${nextDraftYear} Rookie Draft`
                : "Rookie Draft"}
            </h2>

            <div className="mt-3 flex flex-wrap gap-2 text-sm text-slate-300">
              <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1">
                Status: Not Started
              </span>

              <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1">
                {rookieDraftRounds} Round
                {rookieDraftRounds === 1 ? "" : "s"}
              </span>

              <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1">
                {nextDraftPicks.length} Pick
                {nextDraftPicks.length === 1 ? "" : "s"}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-500 opacity-70"
            >
              Configure Draft
            </button>

            <button
              type="button"
              disabled
              className="rounded-lg bg-slate-700 px-4 py-2 text-sm font-semibold text-slate-400 opacity-70"
            >
              Draft Room Coming Soon
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Picks"
          value={String(picks.length)}
          detail="Tracked future draft assets"
        />

        <SummaryCard
          label="Active"
          value={String(activePickCount)}
          detail="Available future picks"
        />

        <SummaryCard
          label="Traded Picks"
          value={String(tradedPicks.length)}
          detail="Owned by another franchise"
          valueClassName={
            tradedPicks.length > 0
              ? "text-emerald-400"
              : "text-white"
          }
        />

        <SummaryCard
          label="Draft Rounds"
          value={String(rookieDraftRounds)}
          detail="Current league setting"
        />
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Traded Draft Capital
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Picks whose current owner differs from the original franchise.
          </p>
        </div>

        {tradedPicks.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
            <p className="font-medium text-white">
              No traded draft picks yet
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Future picks will appear here after ownership changes.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {tradedPicks.map((pick) => (
              <div
                key={pick.id}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold text-white">
                      {pick.seasonYear ?? "Future"}{" "}
                      {getRoundLabel(pick.round)}
                    </p>

                    <p className="mt-1 text-xs text-slate-500">
                      {pick.pickNumber
                        ? `Pick ${pick.pickNumber}`
                        : "Pick number TBD"}
                    </p>
                  </div>

                  <span className="rounded-full border border-emerald-900/60 bg-emerald-950/30 px-2 py-1 text-xs font-medium text-emerald-300">
                    Traded
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
                  <TeamReference
                    label="Original"
                    value={pick.originalTeamName}
                  />

                  <span className="text-slate-600">
                    →
                  </span>

                  <TeamReference
                    label="Current Owner"
                    value={pick.currentTeamName}
                    align="right"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            Draft Capital by Team
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Every active future pick currently controlled by each franchise.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {teams.map((team) => {
            const teamPicks = picks
              .filter(
                (pick) =>
                  pick.currentTeamId === team.id &&
                  pick.status === "active",
              )
              .sort((a, b) => {
                const yearA =
                  a.seasonYear ?? 9999;

                const yearB =
                  b.seasonYear ?? 9999;

                if (yearA !== yearB) {
                  return yearA - yearB;
                }

                if (a.round !== b.round) {
                  return a.round - b.round;
                }

                return (
                  (a.pickNumber ?? 9999) -
                  (b.pickNumber ?? 9999)
                );
              });

            return (
              <div
                key={team.id}
                className="rounded-xl border border-slate-800 bg-slate-900"
              >
                <div className="border-b border-slate-800 p-5">
                  <h3 className="font-semibold text-white">
                    {team.name}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    {teamPicks.length} future pick
                    {teamPicks.length === 1 ? "" : "s"}
                  </p>
                </div>

                {teamPicks.length === 0 ? (
                  <div className="p-5 text-sm text-slate-500">
                    No active future picks.
                  </div>
                ) : (
                  <div className="grid gap-2 p-4 sm:grid-cols-2">
                    {teamPicks.map((pick) => {
                      const traded =
                        pick.originalTeamId !==
                        pick.currentTeamId;

                      return (
                        <div
                          key={pick.id}
                          className="rounded-lg border border-slate-800 bg-slate-950 p-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-medium text-white">
                              {pick.seasonYear ?? "Future"}{" "}
                              {getRoundLabel(pick.round)}
                            </p>

                            {traded ? (
                              <span className="rounded-full border border-emerald-900/60 bg-emerald-950/30 px-2 py-0.5 text-[10px] font-medium text-emerald-300">
                                Acquired
                              </span>
                            ) : null}
                          </div>

                          <p className="mt-1 text-xs text-slate-500">
                            {traded
                              ? `Originally ${pick.originalTeamName}`
                              : "Original pick"}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border border-slate-800 bg-slate-900 p-5">
        <div>
          <h2 className="text-lg font-semibold text-white">
            Filter Draft Picks
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Narrow ownership by year, round, or current team.
          </p>
        </div>

        <form
          method="get"
          className="mt-5 grid gap-4 md:grid-cols-3 xl:grid-cols-[1fr_1fr_2fr_auto]"
        >
          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Year
            </label>

            <select
              name="year"
              defaultValue={filters.year ?? ""}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="">
                All Years
              </option>

              {years.map((year) => (
                <option
                  key={year}
                  value={year}
                >
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Round
            </label>

            <select
              name="round"
              defaultValue={filters.round ?? ""}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="">
                All Rounds
              </option>

              {rounds.map((round) => (
                <option
                  key={round}
                  value={round}
                >
                  {getRoundLabel(round)} Round
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Current Owner
            </label>

            <select
              name="team"
              defaultValue={filters.team ?? ""}
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white"
            >
              <option value="">
                All Teams
              </option>

              {teams.map((team) => (
                <option
                  key={team.id}
                  value={team.id}
                >
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-slate-200"
            >
              Apply
            </button>

            <Link
              href={`/leagues/${leagueId}/draft`}
              className="rounded-lg border border-slate-700 px-4 py-2 text-sm font-semibold text-slate-300 hover:bg-slate-800"
            >
              Reset
            </Link>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-white">
            All Draft Picks
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            {filteredPicks.length} draft pick
            {filteredPicks.length === 1 ? "" : "s"} shown.
          </p>
        </div>

        {filteredPicks.length === 0 ? (
          <div className="rounded-xl border border-slate-800 bg-slate-900 p-6 text-center">
            <p className="font-medium text-white">
              No draft picks found
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Try changing the filters above.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-950/50">
                  <tr>
                    <TableHeader>Year</TableHeader>
                    <TableHeader>Round</TableHeader>
                    <TableHeader>Original Team</TableHeader>
                    <TableHeader>Current Owner</TableHeader>
                    <TableHeader>Pick #</TableHeader>
                    <TableHeader>Status</TableHeader>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800">
                  {filteredPicks.map((pick) => {
                    const traded =
                      pick.originalTeamId !==
                      pick.currentTeamId;

                    return (
                      <tr
                        key={pick.id}
                        className="hover:bg-slate-800/40"
                      >
                        <TableCell>
                          {pick.seasonYear ?? "—"}
                        </TableCell>

                        <TableCell>
                          {getRoundLabel(pick.round)}
                        </TableCell>

                        <TableCell>
                          {pick.originalTeamName}
                        </TableCell>

                        <TableCell>
                          <div className="flex flex-wrap items-center gap-2">
                            <span>
                              {pick.currentTeamName}
                            </span>

                            {traded ? (
                              <span className="rounded-full border border-emerald-900/60 bg-emerald-950/30 px-2 py-0.5 text-xs font-medium text-emerald-300">
                                Traded
                              </span>
                            ) : null}
                          </div>
                        </TableCell>

                        <TableCell>
                          {pick.pickNumber ?? "TBD"}
                        </TableCell>

                        <TableCell>
                          <span className="rounded-full border border-slate-700 bg-slate-950 px-2 py-1 text-xs font-medium capitalize text-slate-300">
                            {pick.status}
                          </span>
                        </TableCell>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  detail: string;
  valueClassName?: string;
};

function SummaryCard({
  label,
  value,
  detail,
  valueClassName = "text-white",
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${valueClassName}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}

type TeamReferenceProps = {
  label: string;
  value: string;
  align?: "left" | "right";
};

function TeamReference({
  label,
  value,
  align = "left",
}: TeamReferenceProps) {
  return (
    <div
      className={
        align === "right"
          ? "text-right"
          : "text-left"
      }
    >
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 break-words font-medium text-white">
        {value}
      </p>
    </div>
  );
}

function TableHeader({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
  );
}

function TableCell({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <td className="whitespace-nowrap px-4 py-4 text-sm text-slate-300">
      {children}
    </td>
  );
}

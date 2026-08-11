import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { DraftPickRepository } from "@/features/draft-picks/repositories/draft-pick-repository";
import { RosterRepository } from "@/features/rosters/repositories/roster-repository";
import { TeamRepository } from "@/features/teams/repositories/team-repository";
import { ManualTradeBuilder } from "@/features/transactions/components/manual-trade/manual-trade-builder";

type NewTradePageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

type DraftPickSeasonRelation = {
  id: string;
  name: string;
  year: number;
};

type DraftPickTeamRelation = {
  id: string;
  name: string;
};

function unwrapRelation<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export default async function NewTradePage({
  params,
}: NewTradePageProps) {
  const { leagueId } = await params;

  const supabase = await createClient();

  const { data: seasons, error } =
    await supabase
      .from("seasons")
      .select(`
        id,
        name,
        year,
        is_active
      `)
      .eq("league_id", leagueId)
      .order("year", {
        ascending: true,
      });

  if (error) {
    throw new Error(error.message);
  }

  const activeSeason =
    (seasons ?? []).find(
      (season) => season.is_active,
    ) ?? null;

  if (!activeSeason) {
    return (
      <div className="space-y-5">
        <Link
          href={`/leagues/${leagueId}/transactions`}
          className="text-sm font-medium text-slate-400 hover:text-white"
        >
          ← Back to Transactions
        </Link>

        <div className="rounded-xl border border-amber-900/60 bg-amber-950/20 p-5">
          <h1 className="text-xl font-semibold text-amber-300">
            No active season
          </h1>

          <p className="mt-2 text-sm text-slate-300">
            An active league season is required before creating a trade.
          </p>
        </div>
      </div>
    );
  }

  const [teams, roster, draftPicks] =
    await Promise.all([
      TeamRepository.getByLeague(
        leagueId,
      ),

      RosterRepository.getByLeagueAndSeason(
        leagueId,
        activeSeason.id,
      ),

      DraftPickRepository.getByLeague(
        leagueId,
      ),
    ]);

  const teamOptions = teams.map(
    (team) => ({
      id: team.id,
      name: team.name,
    }),
  );

  const rosterPlayers = roster.map(
    (row) => {
      const player = unwrapRelation(
        row.players,
      );

      return {
        playerId: row.player_id,
        teamId: row.team_id,

        firstName:
          player?.first_name ?? null,

        lastName:
          player?.last_name ?? null,

        position:
          player?.position ?? null,

        proTeam:
          player?.pro_team ?? null,
      };
    },
  );

  const draftPickOptions =
    draftPicks.map((row) => {
      const season = unwrapRelation(
        row.seasons as
          | DraftPickSeasonRelation
          | DraftPickSeasonRelation[]
          | null,
      );

      const originalTeam =
        unwrapRelation(
          row.original_team as
            | DraftPickTeamRelation
            | DraftPickTeamRelation[]
            | null,
        );

      return {
        id: row.id,

        currentTeamId:
          row.current_team_id,

        originalTeamId:
          row.original_team_id,

        originalTeamName:
          originalTeam?.name ?? null,

        seasonId:
          row.season_id,

        seasonYear:
          season?.year ?? null,

        round:
          row.round,

        pickNumber:
          row.pick_number ?? null,
      };
    });

  return (
    <div className="space-y-6">
      <div>
        <Link
          href={`/leagues/${leagueId}/transactions`}
          className="text-sm font-medium text-slate-400 hover:text-white"
        >
          ← Back to Transactions
        </Link>

        <p className="mt-5 text-sm font-medium text-emerald-400">
          Commissioner Tools
        </p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          Create Manual Trade
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Select two teams and the players or draft picks changing
          hands. The trade will enter the pending transaction queue
          and will not affect league data until it is approved and
          applied.
        </p>

        <p className="mt-2 text-xs text-slate-500">
          Active season: {activeSeason.name}
        </p>
      </div>

      <ManualTradeBuilder
        leagueId={leagueId}
        seasonId={activeSeason.id}
        teams={teamOptions}
        rosterPlayers={rosterPlayers}
        draftPicks={draftPickOptions}
      />
    </div>
  );
}
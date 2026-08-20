import "server-only";

import { createClient } from "@/lib/supabase/server";

function getDemoLeagueId() {
  const leagueId =
    process.env.DEMO_LEAGUE_ID;

  if (!leagueId) {
    throw new Error(
      "DEMO_LEAGUE_ID is not configured.",
    );
  }

  return leagueId;
}

export const DemoLeagueService = {
  getLeagueId() {
    return getDemoLeagueId();
  },

  async getLeague() {
    const leagueId =
      getDemoLeagueId();

    const supabase =
      await createClient();

    const {
      data: league,
      error: leagueError,
    } = await supabase
      .from("leagues")
      .select(`
        id,
        name,
        current_season_id
      `)
      .eq(
        "id",
        leagueId,
      )
      .single();

    if (leagueError) {
      throw new Error(
        leagueError.message,
      );
    }

    let season: {
      id: string;
      name: string | null;
      year: number;
      status: string | null;
    } | null = null;

    if (
      league.current_season_id
    ) {
      const {
        data,
        error,
      } = await supabase
        .from("seasons")
        .select(`
          id,
          name,
          year,
          status
        `)
        .eq(
          "id",
          league.current_season_id,
        )
        .eq(
          "league_id",
          leagueId,
        )
        .maybeSingle();

      if (error) {
        throw new Error(
          error.message,
        );
      }

      season = data;
    }

    return {
      id: league.id,
      name: league.name,
      currentSeasonId:
        league.current_season_id,
      season,
    };
  },
};
import { createClient } from "@/lib/supabase/server";

export const RookieDraftRepository = {
  async getByLeagueAndSeason(params: {
    leagueId: string;
    seasonId: string;
  }) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("rookie_drafts")
        .select(`
          id,
          league_id,
          season_id,
          operation_season_id,
          name,
          status,
          rounds,
          opens_at,
          closes_at,
          started_at,
          completed_at,
          current_pick_number
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .eq(
          "season_id",
          params.seasonId,
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? null;
  },

  async getDraftPicksForSeason(params: {
    leagueId: string;
    seasonId: string;
  }) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("draft_picks")
        .select(`
          id,
          league_id,
          season_id,
          round,
          original_team_id,
          current_team_id,
          pick_number,
          status
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .eq(
          "season_id",
          params.seasonId,
        )
        .eq(
          "status",
          "active",
        )
        .order(
          "round",
          {
            ascending: true,
          },
        )
        .order(
          "pick_number",
          {
            ascending: true,
            nullsFirst: false,
          },
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },
};
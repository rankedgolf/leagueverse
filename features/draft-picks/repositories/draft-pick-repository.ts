import { createClient } from "@/lib/supabase/server";

export const DraftPickRepository = {
  async getByLeague(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("draft_picks")
      .select(`
        id,
        league_id,
        season_id,
        round,
        original_team_id,
        current_team_id,
        pick_number,
        status,
        created_at,
        updated_at,
        seasons (
          id,
          name,
          year
        ),
        original_team:teams!draft_picks_original_team_id_fkey (
          id,
          name
        ),
        current_team:teams!draft_picks_current_team_id_fkey (
          id,
          name
        )
      `)
      .eq("league_id", leagueId)
      .eq("status", "active")
      .order("round", {
        ascending: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async getByCurrentTeam(params: {
    leagueId: string;
    teamId: string;
  }) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("draft_picks")
      .select(`
        id,
        league_id,
        season_id,
        round,
        original_team_id,
        current_team_id,
        pick_number,
        status,
        seasons (
          id,
          name,
          year
        ),
        original_team:teams!draft_picks_original_team_id_fkey (
          id,
          name
        )
      `)
      .eq("league_id", params.leagueId)
      .eq(
        "current_team_id",
        params.teamId,
      )
      .eq("status", "active")
      .order("round", {
        ascending: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async getByIds(params: {
    leagueId: string;
    draftPickIds: string[];
  }) {
    if (
      params.draftPickIds.length === 0
    ) {
      return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("draft_picks")
      .select(`
        id,
        league_id,
        season_id,
        round,
        original_team_id,
        current_team_id,
        pick_number,
        status,
        seasons (
          id,
          name,
          year
        ),
        original_team:teams!draft_picks_original_team_id_fkey (
          id,
          name
        )
      `)
      .eq("league_id", params.leagueId)
      .in("id", params.draftPickIds);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
};
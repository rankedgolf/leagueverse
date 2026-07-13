import { createClient } from "@/lib/supabase/server";

export const StandingRepository = {
  async getByLeagueAndSeason(leagueId: string, seasonId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("standings")
      .select(`
        *,
        teams (
          id,
          name,
          abbreviation
        )
      `)
      .eq("league_id", leagueId)
      .eq("season_id", seasonId);

    if (error) throw error;

    return data ?? [];
  },
};
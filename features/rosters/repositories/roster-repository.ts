import { createClient } from "@/lib/supabase/server";

export const RosterRepository = {
  async getByLeagueAndSeason(leagueId: string, seasonId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("team_rosters")
      .select(`
        id,
        league_id,
        season_id,
        team_id,
        player_id,
        roster_slot,
        teams (
          id,
          name
        ),
        players (
          id,
          first_name,
          last_name,
          position,
          pro_team
        )
      `)
      .eq("league_id", leagueId)
      .eq("season_id", seasonId);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
};
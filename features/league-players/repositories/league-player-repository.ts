import { createClient } from "@/lib/supabase/server";

export const LeaguePlayerRepository = {
  async getByLeague(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("league_players")
      .select(`
        id,
        league_id,
        player_id,
        status,
        current_team_id,
        players (
          id,
          display_name,
          full_name,
          first_name,
          last_name,
          position,
          pro_team
        ),
        teams:current_team_id (
          id,
          name
        )
      `)
      .eq("league_id", leagueId);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
};
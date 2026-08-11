import { createClient } from "@/lib/supabase/server";

export const SleeperSyncTransactionRepository = {
  async getLeaguePlayerContext(params: {
    leagueId: string;
    playerIds: string[];
  }) {
    if (params.playerIds.length === 0) {
      return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("league_players")
      .select(`
        id,
        player_id,
        current_team_id,
        status,
        contracts (
          id,
          team_id,
          status,
          total_value
        )
      `)
      .eq("league_id", params.leagueId)
      .in("player_id", params.playerIds);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async getActiveSeason(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
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

    const seasons = data ?? [];

    return (
      seasons.find((season) => season.is_active) ??
      seasons[0] ??
      null
    );
  },
};
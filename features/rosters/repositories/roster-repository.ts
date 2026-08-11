import { createClient } from "@/lib/supabase/server";
import type { ServerSupabaseClient } from "@/lib/supabase/types";

export const RosterRepository = {
  async getByLeagueAndSeason(
  leagueId: string,
  seasonId: string,
  client?: ServerSupabaseClient,
) {
  const supabase =
    client ?? (await createClient());

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

  async getActiveContractsByLeague(
    leagueId: string,
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("contracts")
      .select(`
        id,
        league_id,
        team_id,
        league_player_id,
        contract_type,
        status,
        starts_season_id,
        ends_season_id,
        total_value,
        guaranteed_value,
        source,
        league_players!inner (
          id,
          player_id
        ),
        contract_years (
          id,
          season_id,
          salary,
          bonus,
          guaranteed_amount,
          seasons (
            id,
            year
          )
        )
      `)
      .eq("league_id", leagueId)
      .eq("status", "active");

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
};
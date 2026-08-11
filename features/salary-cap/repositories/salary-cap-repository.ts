import { createClient } from "@/lib/supabase/server";

export const SalaryCapRepository = {
  async getLeagueCapData(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("contract_years")
      .select(`
        id,
        contract_id,
        league_id,
        season_id,
        salary,
        bonus,
        contracts!inner (
          id,
          league_id,
          team_id,
          league_player_id,
          status,
          total_value,
          starts_season_id,
          ends_season_id,
          teams (
            id,
            name
          ),
          league_players (
            id,
            player_id,
            players (
              id,
              display_name,
              full_name,
              position,
              pro_team
            )
          ),
          end_season:seasons!contracts_ends_season_id_fkey (
            id,
            name,
            year
          )
        ),
        seasons (
          id,
          name,
          year,
          is_active
        )
      `)
      .eq("league_id", leagueId)
      .eq("contracts.status", "active");

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async getTeamsByLeague(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("teams")
      .select(`
        id,
        name
      `)
      .eq("league_id", leagueId)
      .order("name");

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async getRosterPlayerCounts(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("team_rosters")
      .select(`
        id,
        team_id
      `)
      .eq("league_id", leagueId);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
};
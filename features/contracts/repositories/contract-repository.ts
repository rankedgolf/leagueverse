import { createClient } from "@/lib/supabase/server";

export const ContractRepository = {
  async getByLeague(leagueId: string) {
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
        signed_at,
        starts_season_id,
        ends_season_id,
        total_value,
        guaranteed_value,
        notes,
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
        start_season:seasons!contracts_starts_season_id_fkey (
          id,
          name
        ),
        end_season:seasons!contracts_ends_season_id_fkey (
          id,
          name
        ),
        contract_years (
          id,
          season_id,
          salary,
          bonus,
          guaranteed_amount,
          is_option_year,
          option_type,
          seasons (
            id,
            name
          )
        )
      `)
      .eq("league_id", leagueId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async getActiveContractByLeaguePlayer(
    leagueId: string,
    leaguePlayerId: string
  ) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("contracts")
      .select("id")
      .eq("league_id", leagueId)
      .eq("league_player_id", leaguePlayerId)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getActiveContractYearCountByTeam(
    leagueId: string,
    teamId: string
  ): Promise<number> {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("contract_years")
      .select(
        `
        id,
        contracts!inner (
          id,
          status,
          team_id
        )
        `,
        {
          count: "exact",
          head: true,
        }
      )
      .eq("league_id", leagueId)
      .eq("contracts.status", "active")
      .eq("contracts.team_id", teamId);

    if (error) {
      throw new Error(error.message);
    }

    return count ?? 0;
  },
};
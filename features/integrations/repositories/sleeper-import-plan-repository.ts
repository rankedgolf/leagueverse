import { createClient } from "@/lib/supabase/server";

export const SleeperImportPlanRepository = {
  async getExistingLeagueData(leagueId: string) {
    const supabase = await createClient();

    const [
      teamsResult,
      leaguePlayersResult,
      contractsResult,
    ] = await Promise.all([
      supabase
        .from("teams")
        .select(`
          id,
          name
        `)
        .eq("league_id", leagueId),

      supabase
        .from("league_players")
        .select(`
          id,
          player_id,
          current_team_id,
          players (
            id,
            display_name,
            full_name,
            position,
            pro_team
          )
        `)
        .eq("league_id", leagueId),

      supabase
        .from("contracts")
        .select(`
          id,
          league_player_id,
          team_id,
          status
        `)
        .eq("league_id", leagueId)
        .eq("status", "active"),
    ]);

    if (teamsResult.error) {
      throw new Error(teamsResult.error.message);
    }

    if (leaguePlayersResult.error) {
      throw new Error(
        leaguePlayersResult.error.message,
      );
    }

    if (contractsResult.error) {
      throw new Error(
        contractsResult.error.message,
      );
    }

    return {
      teams: teamsResult.data ?? [],
      leaguePlayers:
        leaguePlayersResult.data ?? [],
      contracts: contractsResult.data ?? [],
    };
  },
};
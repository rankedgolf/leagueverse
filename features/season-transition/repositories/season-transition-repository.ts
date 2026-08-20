import { createClient } from "@/lib/supabase/server";

export const SeasonTransitionRepository = {
  async getEligiblePlayers(params: {
    leagueId: string;
    seasonId: string;
  }) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("contract_years")
        .select(`
          id,
          contract_id,
          contracts!inner (
            id,
            status,
            league_player_id,
            team_id,
            league_players (
              id,
              player_id,
              current_team_id
            )
          )
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
          "contracts.status",
          "active",
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },

  async getRosterRows(params: {
    leagueId: string;
    seasonId: string;
  }) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("team_rosters")
        .select(`
          id,
          player_id,
          team_id
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .eq(
          "season_id",
          params.seasonId,
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },

  async getOperations(params: {
    leagueId: string;
    seasonId: string;
  }) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from(
          "league_operation_periods",
        )
        .select(`
          phase,
          status
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .eq(
          "season_id",
          params.seasonId,
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },
};
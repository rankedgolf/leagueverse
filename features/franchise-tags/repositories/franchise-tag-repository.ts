import { createClient } from "@/lib/supabase/server";

export const FranchiseTagRepository = {
  async getTeamTagUsage(params: {
    leagueId: string;
    teamId: string;
    seasonId: string;
  }) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("franchise_tag_usages")
        .select(`
          id,
          league_id,
          team_id,
          season_id,
          league_player_id,
          source_contract_id,
          tagged_contract_id,
          transaction_id,
          previous_cap_hit,
          tag_cap_hit
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .eq(
          "team_id",
          params.teamId,
        )
        .eq(
          "season_id",
          params.seasonId,
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? null;
  },

  async getPlayerTagHistory(params: {
    leagueId: string;
    leaguePlayerId: string;
  }) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("franchise_tag_usages")
        .select(`
          id,
          season_id,
          league_player_id,
          tagged_contract_id,
          seasons (
            id,
            name,
            year
          )
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .eq(
          "league_player_id",
          params.leaguePlayerId,
        )
        .order(
          "created_at",
          {
            ascending: false,
          },
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },
};
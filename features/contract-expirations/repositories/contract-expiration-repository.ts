import { createClient } from "@/lib/supabase/server";

export const ContractExpirationRepository = {
  async getTagUsagesForSourceSeason(params: {
    leagueId: string;
    sourceContractIds: string[];
  }) {
    if (
      params.sourceContractIds.length === 0
    ) {
      return [];
    }

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
          tag_cap_hit,
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
        .in(
          "source_contract_id",
          params.sourceContractIds,
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },
};
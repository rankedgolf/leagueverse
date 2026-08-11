import { createClient } from "@/lib/supabase/server";
import type { ServerSupabaseClient } from "@/lib/supabase/types";

export const FreeAgencyScoringRepository = {
async getActiveOffersForPlayer(
  params: {
    leagueId: string;
    freeAgencyPeriodId: string;
    leaguePlayerId: string;
  },
  client?: ServerSupabaseClient,
) {
  const supabase =
    client ?? (await createClient());

    const { data, error } =
      await supabase
        .from("free_agency_offers")
        .select(`
          id,
          league_id,
          season_id,
          free_agency_period_id,
          league_player_id,
          team_id,
          status,
          contract_years,
          total_value,
          guaranteed_value,
          signing_bonus,
          year_one_salary,
          salary_structure,
          submitted_at
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .eq(
          "free_agency_period_id",
          params.freeAgencyPeriodId,
        )
        .eq(
          "league_player_id",
          params.leaguePlayerId,
        )
        .eq(
          "status",
          "active",
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },

  async getPlayerProfile(
  params: {
    leagueId: string;
    leaguePlayerId: string;
  },
  client?: ServerSupabaseClient,
) {
  const supabase =
    client ?? (await createClient());

    const { data, error } =
      await supabase
        .from(
          "player_free_agency_profiles",
        )
        .select(`
          id,
          league_id,
          league_player_id,
          money_weight,
          winning_weight,
          role_weight,
          security_weight,
          stability_weight,
          loyalty_weight,
          risk_tolerance,
          decision_tendency,
          personality_seed
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .eq(
          "league_player_id",
          params.leaguePlayerId,
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? null;
  },

  async getLeaguePlayer(
  params: {
    leagueId: string;
    leaguePlayerId: string;
  },
  client?: ServerSupabaseClient,
) {
  const supabase =
    client ?? (await createClient());

    const { data, error } =
      await supabase
        .from("league_players")
        .select(`
          id,
          player_id,
          status,
          current_team_id,
          players (
            id,
            display_name,
            full_name,
            position,
            pro_team
          )
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .eq(
          "id",
          params.leaguePlayerId,
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? null;
  },

 async getSettings(
  leagueId: string,
  client?: ServerSupabaseClient,
) {
  const supabase =
    client ?? (await createClient());

    const { data, error } =
      await supabase
        .from(
          "league_contract_settings",
        )
        .select(`
          free_agency_randomness
        `)
        .eq(
          "league_id",
          leagueId,
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? null;
  },

  async saveScores(
  scores: {
    offerId: string;
    score: number;
    rank: number;
    metadata: Record<
      string,
      unknown
    >;
  }[],
  client?: ServerSupabaseClient,
) {
  if (scores.length === 0) {
    return [];
  }

  const supabase =
    client ?? (await createClient());

    const results = [];

    for (const score of scores) {
      const { data, error } =
        await supabase
          .from(
            "free_agency_offers",
          )
          .update({
            decision_score:
              score.score,

            decision_rank:
              score.rank,

            decision_metadata:
              score.metadata,

            updated_at:
              new Date().toISOString(),
          })
          .eq(
            "id",
            score.offerId,
          )
          .eq(
            "status",
            "active",
          )
          .select(`
            id,
            decision_score,
            decision_rank,
            decision_metadata
          `)
          .single();

      if (error) {
        throw new Error(
          error.message,
        );
      }

      results.push(data);
    }

    return results;
  },
};
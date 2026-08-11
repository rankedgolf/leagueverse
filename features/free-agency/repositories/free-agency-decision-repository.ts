import { createClient } from "@/lib/supabase/server";
import type { ServerSupabaseClient } from "@/lib/supabase/types";

export const FreeAgencyDecisionRepository = {
async getOffer(
  offerId: string,
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
          submitted_by,
          decision_score,
          decision_rank,
          decision_metadata
        `)
        .eq("id", offerId)
        .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ?? null;
  },

  async getActiveOffers(
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
          team_id,
          status,
          decision_score,
          decision_rank
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
        .eq("status", "active");

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
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
            position
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
      throw new Error(error.message);
    }

    return data ?? null;
  },

  async acceptOffer(
  offerId: string,
  client?: ServerSupabaseClient,
) {
  const supabase =
    client ?? (await createClient());

    const { data, error } =
      await supabase
        .from("free_agency_offers")
        .update({
          status: "accepted",
          decided_at:
            new Date().toISOString(),
          updated_at:
            new Date().toISOString(),
        })
        .eq("id", offerId)
        .eq("status", "active")
        .select(`
          id,
          status
        `)
        .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async declineOtherOffers(
  params: {
    leagueId: string;
    freeAgencyPeriodId: string;
    leaguePlayerId: string;
    winningOfferId: string;
  },
  client?: ServerSupabaseClient,
) {
  const supabase =
    client ?? (await createClient());

    const { data, error } =
      await supabase
        .from("free_agency_offers")
        .update({
          status: "declined",
          decided_at:
            new Date().toISOString(),
          updated_at:
            new Date().toISOString(),
        })
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
        .eq("status", "active")
        .neq(
          "id",
          params.winningOfferId,
        )
        .select(`
          id,
          status
        `);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
};
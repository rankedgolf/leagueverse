import { createClient } from "@/lib/supabase/server";
import type { ServerSupabaseClient } from "@/lib/supabase/types";

export const FreeAgencyProcessingRepository = {
  async getPeriod(
  periodId: string,
  client?: ServerSupabaseClient,
) {
  const supabase =
    client ?? (await createClient());

    const { data, error } = await supabase
      .from("free_agency_periods")
      .select(`
        id,
        league_id,
        season_id,
        status,
        opens_at,
        closes_at,
        decisions_begin_at,
        decisions_end_at,
        decision_frequency_hours,
        next_decision_at,
        last_decision_at
      `)
      .eq("id", periodId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

 async getPlayersWithActiveOffers(
  params: {
    leagueId: string;
    periodId: string;
  },
  client?: ServerSupabaseClient,
) {
  const supabase =
    client ?? (await createClient());

    const { data, error } = await supabase
      .from("free_agency_offers")
      .select(`
        league_player_id
      `)
      .eq("league_id", params.leagueId)
      .eq("free_agency_period_id", params.periodId)
      .eq("status", "active");

    if (error) {
      throw new Error(error.message);
    }

    return [
      ...new Set(
        (data ?? []).map(
          (row) => row.league_player_id,
        ),
      ),
    ];
  },

  async getDecidedPlayerIds(
  periodId: string,
  client?: ServerSupabaseClient,
) {
  const supabase =
    client ?? (await createClient());

    const { data, error } = await supabase
      .from("free_agency_decisions")
      .select("league_player_id")
      .eq(
        "free_agency_period_id",
        periodId,
      );

    if (error) {
      throw new Error(error.message);
    }

    return new Set(
      (data ?? []).map(
        (row) => row.league_player_id,
      ),
    );
  },

async markProcessed(
  params: {
    periodId: string;
    processedAt: Date;
    frequencyHours: number;
  },
  client?: ServerSupabaseClient,
) {
  const supabase =
    client ?? (await createClient());

    const nextDecisionAt =
      new Date(
        params.processedAt.getTime() +
          params.frequencyHours *
            60 *
            60 *
            1000,
      );

    const { error } = await supabase
      .from("free_agency_periods")
      .update({
        last_decision_at:
          params.processedAt.toISOString(),

        next_decision_at:
          nextDecisionAt.toISOString(),

        updated_at:
          params.processedAt.toISOString(),
      })
      .eq("id", params.periodId);

    if (error) {
      throw new Error(error.message);
    }

    return {
      nextDecisionAt:
        nextDecisionAt.toISOString(),
    };
  },
};

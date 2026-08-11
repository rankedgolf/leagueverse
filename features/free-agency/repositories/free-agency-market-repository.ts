import { createClient } from "@/lib/supabase/server";

type FreeAgentRow = {
  id: string;
  player_id: string;
  status: string | null;

  players:
    | {
        id: string;
        full_name: string;
        display_name: string | null;
        position: string | null;
        pro_team: string | null;
      }
    | {
        id: string;
        full_name: string;
        display_name: string | null;
        position: string | null;
        pro_team: string | null;
      }[]
    | null;

  player_free_agency_profiles:
    | {
        money_weight: number | string;
        winning_weight: number | string;
        role_weight: number | string;
        security_weight: number | string;
        stability_weight: number | string;
        loyalty_weight: number | string;

        risk_tolerance: string;
        decision_tendency: string;
      }
    | {
        money_weight: number | string;
        winning_weight: number | string;
        role_weight: number | string;
        security_weight: number | string;
        stability_weight: number | string;
        loyalty_weight: number | string;

        risk_tolerance: string;
        decision_tendency: string;
      }[]
    | null;
};

export const FreeAgencyMarketRepository = {
  async getFreeAgents(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("league_players")
      .select(`
        id,
        player_id,
        status,
        players (
          id,
          full_name,
          display_name,
          position,
          pro_team
        ),
        player_free_agency_profiles (
          money_weight,
          winning_weight,
          role_weight,
          security_weight,
          stability_weight,
          loyalty_weight,
          risk_tolerance,
          decision_tendency
        )
      `)
      .eq("league_id", leagueId)
      .eq("status", "free_agent")
      .order("player_id");

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []) as FreeAgentRow[];
  },

  async getOfferCounts(params: {
  leagueId: string;
  leaguePlayerIds: string[];
}) {
  if (params.leaguePlayerIds.length === 0) {
    return new Map<string, number>();
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("free_agency_offers")
    .select(`
      league_player_id,
      status
    `)
    .eq("league_id", params.leagueId)
    .eq("status", "active");

  if (error) {
    throw new Error(error.message);
  }

  const validPlayerIds = new Set(
    params.leaguePlayerIds,
  );

  const counts = new Map<string, number>();

  for (const row of data ?? []) {
    if (
      !validPlayerIds.has(
        row.league_player_id,
      )
    ) {
      continue;
    }

    counts.set(
      row.league_player_id,
      (counts.get(
        row.league_player_id,
      ) ?? 0) + 1,
    );
  }

  return counts;
},
};
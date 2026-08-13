import { createClient } from "@/lib/supabase/server";

export const LeagueOperationRepository = {
  async getByLeagueAndSeason(params: {
    leagueId: string;
    seasonId: string;
  }) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("league_operation_periods")
        .select(`
          id,
          league_id,
          season_id,
          phase,
          status,
          opens_at,
          closes_at,
          opened_at,
          closed_at,
          processed_at
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .eq(
          "season_id",
          params.seasonId,
        )
        .order(
          "opens_at",
          {
            ascending: true,
            nullsFirst: false,
          },
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },

  async getPhase(params: {
    leagueId: string;
    seasonId: string;
    phase: string;
  }) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("league_operation_periods")
        .select(`
          id,
          league_id,
          season_id,
          phase,
          status,
          opens_at,
          closes_at,
          opened_at,
          closed_at,
          processed_at
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
          "phase",
          params.phase,
        )
        .maybeSingle();

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? null;
  },
};
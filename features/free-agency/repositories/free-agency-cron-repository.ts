import type { ServerSupabaseClient } from "@/lib/supabase/types";

export const FreeAgencyCronRepository = {
  async getDuePeriods(
    client: ServerSupabaseClient,
  ) {
    const now =
      new Date().toISOString();

    const { data, error } =
      await client
        .from("free_agency_periods")
        .select(`
          id,
          league_id,
          season_id,
          status,
          next_decision_at,
          decisions_begin_at,
          decisions_end_at
        `)
        .eq("status", "open")
        .lte(
          "next_decision_at",
          now,
        )
        .lte(
          "decisions_begin_at",
          now,
        )
        .gte(
          "decisions_end_at",
          now,
        )
        .order(
          "next_decision_at",
          {
            ascending: true,
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
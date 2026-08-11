import { createClient } from "@/lib/supabase/server";
import type { ServerSupabaseClient } from "@/lib/supabase/types";

export const StandingRepository = {
  async getByLeagueAndSeason(
  leagueId: string,
  seasonId: string,
  client?: ServerSupabaseClient,
) {
  const supabase =
    client ?? (await createClient());

    const { data, error } = await supabase
      .from("standings")
      .select("*")
      .eq("league_id", leagueId)
      .eq("season_id", seasonId);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
};
import { createClient } from "@/lib/supabase/server";

export const SeasonRepository = {
  async getByLeague(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("seasons")
      .select(`
        id,
        league_id,
        name,
        year,
        status,
        is_active,
        start_date,
        end_date,
        created_at
      `)
      .eq("league_id", leagueId)
      .order("year", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async getActiveByLeague(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("seasons")
      .select(`
        id,
        league_id,
        name,
        year,
        status,
        is_active,
        start_date,
        end_date,
        created_at
      `)
      .eq("league_id", leagueId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
};
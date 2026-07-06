import { createClient } from "@/lib/supabase/server";

export const LeagueRepository = {
  async getMembership(leagueId: string, userId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("league_members")
      .select("role,status")
      .eq("league_id", leagueId)
      .eq("user_id", userId)
      .single();

    if (error) return null;

    return data;
  },

  async getById(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("leagues")
      .select("id,name,current_season_id,provider_primary")
      .eq("id", leagueId)
      .single();

    if (error) return null;

    return data;
  },

  async getSeasonById(seasonId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("seasons")
      .select("id,name,year,status")
      .eq("id", seasonId)
      .single();

    if (error) return null;

    return data;
  },

  async getMemberCount(leagueId: string) {
    const supabase = await createClient();

    const { count, error } = await supabase
      .from("league_members")
      .select("*", { count: "exact", head: true })
      .eq("league_id", leagueId)
      .eq("status", "active");

    if (error) return 0;

    return count || 0;
  },

  async hasSalaryCapSettings(leagueId: string, seasonId: string | null) {
    if (!seasonId) return false;

    const supabase = await createClient();

    const { data } = await supabase
      .from("salary_cap_settings")
      .select("id")
      .eq("league_id", leagueId)
      .eq("season_id", seasonId)
      .maybeSingle();

    return Boolean(data);
  },
};
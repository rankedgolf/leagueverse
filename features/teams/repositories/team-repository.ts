import { createClient } from "@/lib/supabase/server";

export const TeamRepository = {
  async getByLeague(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("teams")
      .select(
        `
        id,
        league_id,
        name,
        nickname,
        abbreviation,
        logo_url,
        primary_color,
        secondary_color,
        created_at
      `
      )
      .eq("league_id", leagueId)
      .order("name");

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
};
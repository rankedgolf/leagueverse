import { createClient } from "@/lib/supabase/server";

export const MemberRepository = {
  async getByLeague(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("league_members")
      .select(
        `
        id,
        role,
        status,
        profiles (
          id,
          email,
          display_name
        ),
        teams!teams_owner_member_id_fkey (
          id,
          name,
          abbreviation
        )
      `
      )
      .eq("league_id", leagueId)
      .order("created_at");

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
};
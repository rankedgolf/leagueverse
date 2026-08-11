import { createClient } from "@/lib/supabase/server";
import type { ServerSupabaseClient } from "@/lib/supabase/types";

export const TeamRepository = {
async getByLeague(
  leagueId: string,
  client?: ServerSupabaseClient,
) {
  const supabase =
    client ?? (await createClient());

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
      owner_member_id,
      created_at,
      league_members (
        id,
        profiles (
          display_name,
          email
        )
      )
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
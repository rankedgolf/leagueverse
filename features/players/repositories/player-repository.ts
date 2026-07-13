import { createClient } from "@/lib/supabase/server";

export const PlayerRepository = {
  async getAll() {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("players")
      .select(`
        id,
        first_name,
        last_name,
        display_name,
        full_name,
        position,
        pro_team,
        sport,
        status
      `)
      .order("display_name", { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
};
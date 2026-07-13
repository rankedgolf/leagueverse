import { createClient } from "@/lib/supabase/server";

export const ContractSettingsRepository = {
  async getByLeague(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("league_contract_settings")
      .select(`
        id,
        league_id,
        salary_cap,
        minimum_salary,
        maximum_contract_length,
        maximum_contract_years_per_team,
        annual_inflation_rate,
        free_agency_mode,
        player_personality_mode_enabled
      `)
      .eq("league_id", leagueId)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
};
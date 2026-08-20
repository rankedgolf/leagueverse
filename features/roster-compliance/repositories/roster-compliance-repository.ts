import { createClient } from "@/lib/supabase/server";

export const RosterComplianceRepository = {
  async getSettings(
    leagueId: string,
  ) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("league_contract_settings")
        .select(`
          salary_cap,
          maximum_roster_size
        `)
        .eq(
          "league_id",
          leagueId,
        )
        .single();

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data;
  },

  async getTeams(
    leagueId: string,
  ) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("teams")
        .select(`
          id,
          name
        `)
        .eq(
          "league_id",
          leagueId,
        )
        .order("name");

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },

  async getContractCommitments(params: {
    leagueId: string;
    seasonId: string;
  }) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("contract_years")
        .select(`
          id,
          salary,
          bonus,
          contracts!inner (
            id,
            team_id,
            status
          )
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
          "contracts.status",
          "active",
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },

  async getDeadCap(params: {
    leagueId: string;
    seasonId: string;
  }) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("dead_cap_charges")
        .select(`
          id,
          team_id,
          amount
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .eq(
          "season_id",
          params.seasonId,
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },

  async getRosterRows(params: {
    leagueId: string;
    seasonId: string;
  }) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("team_rosters")
        .select(`
          id,
          team_id,
          player_id
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .eq(
          "season_id",
          params.seasonId,
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },
};
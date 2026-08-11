import { createClient } from "@/lib/supabase/server";

export const SleeperSyncPreviewRepository = {
  async getActiveSeason(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("seasons")
      .select(`
        id,
        name,
        year,
        is_active
      `)
      .eq("league_id", leagueId)
      .order("year", {
        ascending: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    const seasons = data ?? [];

    return (
      seasons.find((season) => season.is_active) ??
      seasons[0] ??
      null
    );
  },

  async getTeamMappings(params: {
    leagueId: string;
    integrationId: string;
  }) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("integration_team_mappings")
      .select(`
        id,
        team_id,
        external_team_id,
        external_owner_id,
        external_team_name,
        teams (
          id,
          name
        )
      `)
      .eq("league_id", params.leagueId)
      .eq("integration_id", params.integrationId);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async getLeagueRoster(params: {
    leagueId: string;
    seasonId: string;
  }) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("team_rosters")
      .select(`
        id,
        team_id,
        player_id,
        roster_slot,
        teams (
          id,
          name
        ),
        players (
          id,
          full_name,
          display_name,
          external_id,
          external_ids
        )
      `)
      .eq("league_id", params.leagueId)
      .eq("season_id", params.seasonId);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async getPlayersBySleeperIds(
    sleeperPlayerIds: string[],
  ) {
    if (sleeperPlayerIds.length === 0) {
      return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("players")
      .select(`
        id,
        full_name,
        display_name,
        external_id,
        external_ids
      `)
      .eq("sport", "nfl")
      .in("external_id", sleeperPlayerIds);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
};
import { createClient } from "@/lib/supabase/server";

type NewTeamInput = {
  leagueId: string;
  name: string;
};

type NewPlayerInput = {
  sleeperPlayerId: string;
  fullName: string;
  firstName: string | null;
  lastName: string | null;
  position: string | null;
  proTeam: string | null;
};

type NewLeaguePlayerInput = {
  leagueId: string;
  playerId: string;
  teamId: string;
};

type RosterAssignmentInput = {
  leagueId: string;
  seasonId: string;
  teamId: string;
  playerId: string;
};

type NewContractInput = {
  leagueId: string;
  teamId: string;
  leaguePlayerId: string;
  startsSeasonId: string;
  endsSeasonId: string;
  totalValue: number;
};

type NewContractYearInput = {
  contractId: string;
  leagueId: string;
  seasonId: string;
  salary: number;
};

export const SleeperImportExecutionRepository = {
  async getSeasons(leagueId: string) {
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

    return data ?? [];
  },

  async getContractSettings(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("league_contract_settings")
      .select(`
        salary_cap,
        minimum_salary,
        maximum_contract_length,
        maximum_contract_years_per_team,
        annual_inflation_rate
      `)
      .eq("league_id", leagueId)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getTeams(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("teams")
      .select(`
        id,
        name
      `)
      .eq("league_id", leagueId);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async createTeams(inputs: NewTeamInput[]) {
    if (inputs.length === 0) {
      return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("teams")
      .insert(
        inputs.map((input) => ({
          league_id: input.leagueId,
          name: input.name,
        })),
      )
      .select(`
        id,
        name
      `);

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

  async createPlayers(inputs: NewPlayerInput[]) {
    if (inputs.length === 0) {
      return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("players")
      .insert(
        inputs.map((input) => ({
          full_name: input.fullName,
          display_name: input.fullName,
          first_name: input.firstName,
          last_name: input.lastName,
          position: input.position,
          real_team: input.proTeam,
          nfl_team: input.proTeam,
          pro_team: input.proTeam,
          sport: "nfl",
          status: "active",
          external_id: input.sleeperPlayerId,
          external_ids: {
            sleeper: input.sleeperPlayerId,
          },
        })),
      )
      .select(`
        id,
        full_name,
        display_name,
        external_id,
        external_ids
      `);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async getLeaguePlayers(params: {
    leagueId: string;
    playerIds: string[];
  }) {
    if (params.playerIds.length === 0) {
      return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("league_players")
      .select(`
        id,
        player_id,
        current_team_id,
        status
      `)
      .eq("league_id", params.leagueId)
      .in("player_id", params.playerIds);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async createLeaguePlayers(
    inputs: NewLeaguePlayerInput[],
  ) {
    if (inputs.length === 0) {
      return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("league_players")
      .insert(
        inputs.map((input) => ({
          league_id: input.leagueId,
          player_id: input.playerId,
          current_team_id: input.teamId,
          status: "active",
        })),
      )
      .select(`
        id,
        player_id,
        current_team_id,
        status
      `);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async updateLeaguePlayerTeams(
    inputs: {
      leaguePlayerId: string;
      teamId: string;
    }[],
  ) {
    const supabase = await createClient();

    for (const input of inputs) {
      const { error } = await supabase
        .from("league_players")
        .update({
          current_team_id: input.teamId,
          status: "active",
          updated_at: new Date().toISOString(),
        })
        .eq("id", input.leaguePlayerId);

      if (error) {
        throw new Error(error.message);
      }
    }
  },

  async upsertRosterAssignments(
    inputs: RosterAssignmentInput[],
  ) {
    if (inputs.length === 0) {
      return [];
    }

    const supabase = await createClient();

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("team_rosters")
      .upsert(
        inputs.map((input) => ({
          league_id: input.leagueId,
          season_id: input.seasonId,
          team_id: input.teamId,
          player_id: input.playerId,
          roster_slot: "bench",
          acquired_type: "sleeper_import",
          acquired_at: now,
          updated_at: now,
        })),
        {
          onConflict:
            "league_id,season_id,player_id",
        },
      )
      .select(`
        id,
        team_id,
        player_id
      `);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async getActiveContracts(params: {
    leagueId: string;
    leaguePlayerIds: string[];
  }) {
    if (params.leaguePlayerIds.length === 0) {
      return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("contracts")
      .select(`
        id,
        league_player_id,
        team_id,
        status
      `)
      .eq("league_id", params.leagueId)
      .eq("status", "active")
      .in(
        "league_player_id",
        params.leaguePlayerIds,
      );

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },

  async createContract(input: NewContractInput) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("contracts")
      .insert({
        league_id: input.leagueId,
        team_id: input.teamId,
        league_player_id:
          input.leaguePlayerId,
        contract_type: "standard",
        status: "active",
        signed_at:
          new Date().toISOString().slice(0, 10),
        starts_season_id:
          input.startsSeasonId,
        ends_season_id:
          input.endsSeasonId,
        total_value: input.totalValue,
        guaranteed_value: input.totalValue,
        notes: "Imported from Sleeper auction draft",
      })
      .select(`
        id,
        league_player_id,
        team_id
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async createContractYears(
    inputs: NewContractYearInput[],
  ) {
    if (inputs.length === 0) {
      return [];
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("contract_years")
      .insert(
        inputs.map((input) => ({
          contract_id: input.contractId,
          league_id: input.leagueId,
          season_id: input.seasonId,
          salary: input.salary,
          bonus: 0,
          guaranteed_amount: input.salary,
          is_option_year: false,
          option_type: null,
        })),
      )
      .select(`
        id,
        contract_id,
        season_id,
        salary
      `);

    if (error) {
      throw new Error(error.message);
    }

    return data ?? [];
  },
};
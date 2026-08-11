import { createClient } from "@/lib/supabase/server";

export type SleeperMasterPlayerInput = {
  sleeperPlayerId: string;

  fullName: string;
  firstName: string | null;
  lastName: string | null;

  position: string | null;
  proTeam: string | null;

  age: number | null;
  yearsExp: number | null;

  fantasyPositions: string[];

  searchRank: number | null;
  depthChartOrder: number | null;

  status: string;
};

export const SleeperMasterPlayerRepository = {
  async upsertPlayers(
    inputs: SleeperMasterPlayerInput[],
  ) {
    if (inputs.length === 0) {
      return {
        processedCount: 0,
      };
    }

    const supabase =
      await createClient();

    const chunkSize = 500;

    let processedCount = 0;

    for (
      let index = 0;
      index < inputs.length;
      index += chunkSize
    ) {
      const chunk = inputs.slice(
        index,
        index + chunkSize,
      );

   const { error } = await supabase
  .from("players")
  .upsert(
    chunk.map((input) => ({
      full_name: input.fullName,
      display_name: input.fullName,

      first_name: input.firstName,
      last_name: input.lastName,

      position: input.position,

      real_team: input.proTeam,
      nfl_team: input.proTeam,
      pro_team: input.proTeam,

      age: input.age,
      years_exp: input.yearsExp,

      fantasy_positions:
        input.fantasyPositions,

      search_rank:
        input.searchRank,

      depth_chart_order:
        input.depthChartOrder,

      sport: "nfl",

      status: input.status,

      external_id:
        input.sleeperPlayerId,

      external_ids: {
        sleeper:
          input.sleeperPlayerId,
      },
    })),
    {
      onConflict:
        "sport,external_id",
    },
  );

if (error) {
  throw new Error(
    error.message,
  );
}

      processedCount +=
        chunk.length;
    }

    return {
      processedCount,
    };
  },

  async getEligibleNflPlayers() {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from("players")
        .select(`
          id,
          external_id,
          full_name,
          position,
          pro_team,
          status
        `)
        .eq("sport", "nfl")
        .eq("status", "active");

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },
};
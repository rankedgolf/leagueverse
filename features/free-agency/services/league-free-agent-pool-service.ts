import { createClient } from "@/lib/supabase/server";

import { SleeperMasterPlayerRepository } from "@/features/integrations/repositories/sleeper-master-player-repository";

const ALLOWED_FREE_AGENT_POSITIONS =
  new Set([
    "QB",
    "RB",
    "WR",
    "TE",
    "K",
    "DEF",
  ]);

export const LeagueFreeAgentPoolService = {
  async initialize(
    leagueId: string,
  ) {
    const supabase =
      await createClient();

    const [
      eligiblePlayers,
      existingResult,
    ] = await Promise.all([
      SleeperMasterPlayerRepository.getEligibleNflPlayers(),

      supabase
        .from("league_players")
        .select(`
          player_id
        `)
        .eq(
          "league_id",
          leagueId,
        ),
    ]);

    if (existingResult.error) {
      throw new Error(
        existingResult.error.message,
      );
    }

    const existingPlayerIds =
      new Set(
        (
          existingResult.data ?? []
        ).map(
          (row) =>
            row.player_id,
        ),
      );

    const allowedPlayers =
      eligiblePlayers.filter(
        (player) =>
          player.position !== null &&
          ALLOWED_FREE_AGENT_POSITIONS.has(
            player.position,
          ),
      );

    const missingPlayers =
      allowedPlayers.filter(
        (player) =>
          !existingPlayerIds.has(
            player.id,
          ),
      );

    if (
      missingPlayers.length === 0
    ) {
      return {
        eligiblePlayerCount:
          allowedPlayers.length,

        existingLeaguePlayerCount:
          existingPlayerIds.size,

        createdFreeAgentCount: 0,
      };
    }

    const chunkSize = 500;

    let createdFreeAgentCount = 0;

    for (
      let index = 0;
      index <
      missingPlayers.length;
      index += chunkSize
    ) {
      const chunk =
        missingPlayers.slice(
          index,
          index + chunkSize,
        );

      const { error } =
        await supabase
          .from("league_players")
          .insert(
            chunk.map(
              (player) => ({
                league_id:
                  leagueId,

                player_id:
                  player.id,

                current_team_id:
                  null,

                status:
                  "free_agent",
              }),
            ),
          );

      if (error) {
        throw new Error(
          error.message,
        );
      }

      createdFreeAgentCount +=
        chunk.length;
    }

    return {
      eligiblePlayerCount:
        allowedPlayers.length,

      existingLeaguePlayerCount:
        existingPlayerIds.size,

      createdFreeAgentCount,
    };
  },
};
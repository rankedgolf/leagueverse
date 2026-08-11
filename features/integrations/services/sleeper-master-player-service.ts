import { SleeperProvider } from "@/features/integrations/providers/sleeper/sleeper-provider";

import {
  SleeperMasterPlayerRepository,
  type SleeperMasterPlayerInput,
} from "@/features/integrations/repositories/sleeper-master-player-repository";

function getSleeperPlayerStatus(params: {
  active?: boolean | null;
  status?: string | null;
}): string {
  if (params.active === false) {
    return "inactive";
  }

  const sleeperStatus =
    params.status
      ?.trim()
      .toLowerCase();

  if (
    sleeperStatus === "inactive" ||
    sleeperStatus === "retired"
  ) {
    return "inactive";
  }

  return "active";
}

export const SleeperMasterPlayerService = {
  async sync() {
    const sleeperPlayers =
      await SleeperProvider.getAllNflPlayers();

    const inputs: SleeperMasterPlayerInput[] =
      Object.entries(
        sleeperPlayers,
      )
        .map(
          ([
            sleeperPlayerId,
            player,
          ]) => {
            const firstName =
              player.first_name ??
              null;

            const lastName =
              player.last_name ??
              null;

            const fallbackName = [
              firstName,
              lastName,
            ]
              .filter(Boolean)
              .join(" ")
              .trim();

            const fullName =
              player.full_name
                ?.trim() ||
              fallbackName;

            if (!fullName) {
              return null;
            }

        return {
  sleeperPlayerId,
  fullName,
  firstName,
  lastName,

  position:
    player.position ??
    player.fantasy_positions?.[0] ??
    null,

  proTeam:
    player.team ?? null,

  age:
    player.age ?? null,

  yearsExp:
    player.years_exp ?? null,

  fantasyPositions:
    player.fantasy_positions ?? [],

  searchRank:
    player.search_rank ?? null,

  depthChartOrder:
    player.depth_chart_order ?? null,

  status:
    getSleeperPlayerStatus({
      active: player.active,
      status: player.status,
    }),
};
          },
        )
        .filter(
          (
            player,
          ): player is SleeperMasterPlayerInput =>
            player !== null,
        );

    const result =
      await SleeperMasterPlayerRepository.upsertPlayers(
        inputs,
      );

    return {
      sleeperPlayerCount:
        Object.keys(
          sleeperPlayers,
        ).length,

      validPlayerCount:
        inputs.length,

      processedCount:
        result.processedCount,
    };
  },
};
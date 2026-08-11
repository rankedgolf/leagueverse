import { createClient } from "@/lib/supabase/server";

import { generateFreeAgencyPersonality } from "@/features/free-agency/lib/free-agency-personality";
import { FreeAgencyProfileRepository } from "@/features/free-agency/repositories/free-agency-profile-repository";

type PlayerRelation = {
  age: number | string | null;
  years_exp: number | null;
  position: string | null;
  search_rank: number | null;
  depth_chart_order: number | null;
};

function unwrapRelation<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function hashStringToSeed(
  value: string,
): number {
  let hash = 2166136261;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash ^= value.charCodeAt(index);

    hash = Math.imul(
      hash,
      16777619,
    );
  }

  return hash >>> 0;
}

export const FreeAgencyProfileService = {
  async generateMissingProfiles(
    leagueId: string,
  ) {
    const supabase =
      await createClient();

    const [
      leaguePlayersResult,
      settingsResult,
      existingProfiles,
    ] = await Promise.all([
      supabase
        .from("league_players")
        .select(`
          id,
          player_id,
          status,
          players (
            age,
            years_exp,
            position,
            search_rank,
            depth_chart_order
          )
        `)
        .eq(
          "league_id",
          leagueId,
        )
        .eq(
          "status",
          "free_agent",
        ),

      supabase
        .from(
          "league_contract_settings",
        )
        .select(`
          free_agency_personality_variation
        `)
        .eq(
          "league_id",
          leagueId,
        )
        .maybeSingle(),

      FreeAgencyProfileRepository.getByLeague(
        leagueId,
      ),
    ]);

    if (leaguePlayersResult.error) {
      throw new Error(
        leaguePlayersResult.error.message,
      );
    }

    if (settingsResult.error) {
      throw new Error(
        settingsResult.error.message,
      );
    }

    const existingIds =
      new Set(
        existingProfiles.map(
          (profile) =>
            profile.league_player_id,
        ),
      );

    const missingPlayers =
      (
        leaguePlayersResult.data ??
        []
      ).filter(
        (leaguePlayer) =>
          !existingIds.has(
            leaguePlayer.id,
          ),
      );

    const variation =
      settingsResult.data
        ?.free_agency_personality_variation;

    const safeVariation =
      variation === "low" ||
      variation === "medium" ||
      variation === "high"
        ? variation
        : "high";

    const profiles =
      missingPlayers.map(
        (leaguePlayer) => {
          const seed =
            hashStringToSeed(
              `${leagueId}:${leaguePlayer.id}:${leaguePlayer.player_id}`,
            );

          const player =
            unwrapRelation(
              leaguePlayer.players as
                | PlayerRelation
                | PlayerRelation[]
                | null,
            );

          return {
            leagueId,

            leaguePlayerId:
              leaguePlayer.id,

            personality:
              generateFreeAgencyPersonality(
                seed,
                {
                  age:
                    player?.age !== null &&
                    player?.age !==
                      undefined
                      ? Number(
                          player.age,
                        )
                      : null,

                  yearsExp:
                    player?.years_exp ??
                    null,

                  position:
                    player?.position ??
                    null,

                  searchRank:
                    player?.search_rank ??
                    null,

                  depthChartOrder:
                    player
                      ?.depth_chart_order ??
                    null,
                },
                safeVariation,
              ),
          };
        },
      );

    const created =
      await FreeAgencyProfileRepository.createMany(
        profiles,
      );

    return {
      freeAgentCount:
        leaguePlayersResult.data
          ?.length ?? 0,

      existingProfileCount:
        existingProfiles.length,

      generatedCount:
        created.length,
    };
  },
};
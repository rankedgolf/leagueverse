import { FreeAgencyMarketRepository } from "@/features/free-agency/repositories/free-agency-market-repository";
import { FreeAgencyProfileService } from "@/features/free-agency/services/free-agency-profile-service";

type PersonalityProfile = {
  money_weight: number | string;
  winning_weight: number | string;
  role_weight: number | string;
  security_weight: number | string;
  stability_weight: number | string;
  loyalty_weight: number | string;

  risk_tolerance: string;
  decision_tendency: string;
};

function unwrapRelation<T>(
  value:
    | T
    | T[]
    | null
    | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getVisibilityCount(
  leaguePlayerId: string,
): number {
  let hash = 2166136261;

  for (
    let index = 0;
    index < leaguePlayerId.length;
    index += 1
  ) {
    hash ^= leaguePlayerId.charCodeAt(
      index,
    );

    hash = Math.imul(
      hash,
      16777619,
    );
  }

  const roll =
    (hash >>> 0) / 4294967295;

  if (roll < 0.12) {
    return 0;
  }

  if (roll < 0.37) {
    return 1;
  }

  if (roll < 0.72) {
    return 2;
  }

  return 3;
}

function getPublicPersonalityHints(
  leaguePlayerId: string,
  profile: PersonalityProfile | null,
): string[] {
  if (!profile) {
    return [];
  }

  const visibilityCount =
    getVisibilityCount(
      leaguePlayerId,
    );

  if (visibilityCount === 0) {
    return [];
  }

  const weightedFactors = [
    {
      label:
        "Values strong financial offers",
      value: Number(
        profile.money_weight,
      ),
    },
    {
      label:
        "Interested in winning situations",
      value: Number(
        profile.winning_weight,
      ),
    },
    {
      label:
        "Prioritizes role and opportunity",
      value: Number(
        profile.role_weight,
      ),
    },
    {
      label:
        "Values contract security",
      value: Number(
        profile.security_weight,
      ),
    },
    {
      label:
        "Values organizational stability",
      value: Number(
        profile.stability_weight,
      ),
    },
    {
      label:
        "Values loyalty and familiarity",
      value: Number(
        profile.loyalty_weight,
      ),
    },
  ].sort(
    (a, b) =>
      b.value - a.value,
  );

  const hints = weightedFactors
    .slice(
      0,
      visibilityCount,
    )
    .map(
      (factor) =>
        factor.label,
    );

  if (
    hints.length < 3 &&
    profile.decision_tendency ===
      "fast"
  ) {
    hints.push(
      "May make a decision quickly",
    );
  } else if (
    hints.length < 3 &&
    profile.decision_tendency ===
      "patient"
  ) {
    hints.push(
      "May take time before deciding",
    );
  } else if (
    hints.length < 3 &&
    profile.decision_tendency ===
      "market_tester"
  ) {
    hints.push(
      "Likely to test the market",
    );
  }

  return hints.slice(
    0,
    visibilityCount,
  );
}

export const FreeAgencyMarketService = {
  async getMarket(
    leagueId: string,
  ) {
    await FreeAgencyProfileService.generateMissingProfiles(
      leagueId,
    );

    const freeAgents =
      await FreeAgencyMarketRepository.getFreeAgents(
        leagueId,
      );

    const offerCounts =
      await FreeAgencyMarketRepository.getOfferCounts(
        {
          leagueId,
          leaguePlayerIds:
            freeAgents.map(
              (row) => row.id,
            ),
        },
      );

    return freeAgents.map(
      (row) => {
        const player =
          unwrapRelation(
            row.players,
          );

        const profile =
          unwrapRelation(
            row.player_free_agency_profiles,
          );

        return {
          leaguePlayerId: row.id,
          playerId: row.player_id,

          name:
            player?.display_name ??
            player?.full_name ??
            "Unknown Player",

          position:
            player?.position ?? null,

          proTeam:
            player?.pro_team ?? null,

          offerCount:
            offerCounts.get(
              row.id,
            ) ?? 0,

        personalityHints:
  getPublicPersonalityHints(
    row.id,
    profile,
  ),
        };
      },
    );
  },
};
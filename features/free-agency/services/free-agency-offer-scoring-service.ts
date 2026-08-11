import { StandingService } from "@/features/standings/services/standing-service";
import { RosterRepository } from "@/features/rosters/repositories/roster-repository";

import { FreeAgencyOfferRepository } from "@/features/free-agency/repositories/free-agency-offer-repository";
import { FreeAgencyScoringRepository } from "@/features/free-agency/repositories/free-agency-scoring-repository";
import type { ServerSupabaseClient } from "@/lib/supabase/types";

type PlayerRelation = {
  id: string;
  display_name: string | null;
  full_name: string | null;
  position: string | null;
  pro_team: string | null;
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

function clamp(
  value: number,
  min = 0,
  max = 100,
) {
  return Math.min(
    max,
    Math.max(
      min,
      value,
    ),
  );
}

function roundScore(
  value: number,
) {
  return (
    Math.round(
      value * 100,
    ) / 100
  );
}

function hashString(
  value: string,
): number {
  let hash = 2166136261;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash ^=
      value.charCodeAt(index);

    hash =
      Math.imul(
        hash,
        16777619,
      );
  }

  return hash >>> 0;
}

function deterministicVariance(
  value: string,
  randomness: number,
) {
  const hash =
    hashString(value);

  const normalized =
    hash / 4294967295;

  const centered =
    normalized * 2 - 1;

  return centered *
    randomness *
    100;
}

function calculateWinningScores(
  standings: Awaited<
    ReturnType<
      typeof StandingService.getLeagueStandings
    >
  >,
) {
  const gamesPlayed =
    standings.reduce(
      (
        total,
        team,
      ) =>
        total +
        team.wins +
        team.losses +
        team.ties,
      0,
    );

  const scores =
    new Map<string, number>();

  if (
    gamesPlayed === 0
  ) {
    for (
      const team
      of standings
    ) {
      scores.set(
        team.teamId,
        50,
      );
    }

    return scores;
  }

  const percentages =
    standings.map(
      (team) => {
        const teamGames =
          team.wins +
          team.losses +
          team.ties;

        const percentage =
          teamGames === 0
            ? 0.5
            : (
                team.wins +
                team.ties *
                  0.5
              ) /
              teamGames;

        return {
          teamId:
            team.teamId,

          percentage,
        };
      },
    );

  const maxPercentage =
    Math.max(
      ...percentages.map(
        (team) =>
          team.percentage,
      ),
    );

  const minPercentage =
    Math.min(
      ...percentages.map(
        (team) =>
          team.percentage,
      ),
    );

  for (
    const team
    of percentages
  ) {
    if (
      maxPercentage ===
      minPercentage
    ) {
      scores.set(
        team.teamId,
        50,
      );

      continue;
    }

    const normalized =
      (
        team.percentage -
        minPercentage
      ) /
      (
        maxPercentage -
        minPercentage
      );

    scores.set(
      team.teamId,
      roundScore(
        25 +
          normalized *
            75,
      ),
    );
  }

  return scores;
}

function calculateRoleScore(params: {
  position: string | null;

  teamId: string;

  rosterRows: Awaited<
    ReturnType<
      typeof RosterRepository.getByLeagueAndSeason
    >
  >;
}) {
  if (!params.position) {
    return 50;
  }

  const position =
    params.position.toUpperCase();

  const competition =
    params.rosterRows.filter(
      (row) => {
        if (
          row.team_id !==
          params.teamId
        ) {
          return false;
        }

        const player =
          unwrapRelation(
            row.players,
          );

        return (
          player?.position
            ?.toUpperCase() ===
          position
        );
      },
    ).length;

  switch (position) {
    case "QB":
      if (competition === 0) {
        return 100;
      }

      if (competition === 1) {
        return 60;
      }

      if (competition === 2) {
        return 40;
      }

      return 25;

    case "RB":
      if (competition === 0) {
        return 100;
      }

      if (competition === 1) {
        return 85;
      }

      if (competition === 2) {
        return 70;
      }

      if (competition === 3) {
        return 55;
      }

      return 40;

    case "WR":
      if (competition <= 1) {
        return 100;
      }

      if (competition === 2) {
        return 90;
      }

      if (competition === 3) {
        return 78;
      }

      if (competition === 4) {
        return 62;
      }

      return 45;

    case "TE":
      if (competition === 0) {
        return 100;
      }

      if (competition === 1) {
        return 78;
      }

      if (competition === 2) {
        return 58;
      }

      return 40;

    case "K":
    case "DEF":
      return competition === 0
        ? 100
        : 55;

    default:
      return 50;
  }
}

function calculateMoneyScore(params: {
  totalValue: number;
  annualSalary: number;

  maxTotalValue: number;
  maxAnnualSalary: number;
}) {
  const totalComponent =
    params.maxTotalValue > 0
      ? (
          params.totalValue /
          params.maxTotalValue
        ) *
        100
      : 50;

  const annualComponent =
    params.maxAnnualSalary > 0
      ? (
          params.annualSalary /
          params.maxAnnualSalary
        ) *
        100
      : 50;

  return roundScore(
    clamp(
      totalComponent *
        0.55 +
        annualComponent *
          0.45,
    ),
  );
}

function calculateSecurityScore(params: {
  totalValue: number;
  guaranteedValue: number;
  signingBonus: number;
  contractYears: number;
}) {
  const guaranteePercentage =
    params.totalValue > 0
      ? params.guaranteedValue /
        params.totalValue
      : 0;

  const bonusPercentage =
    params.totalValue > 0
      ? params.signingBonus /
        params.totalValue
      : 0;

  const yearsScore =
    clamp(
      params.contractYears /
        5 *
        100,
    );

  return roundScore(
    clamp(
      guaranteePercentage *
        100 *
        0.55 +
        bonusPercentage *
          100 *
          0.25 +
        yearsScore *
          0.2,
    ),
  );
}

function calculateStabilityScore(
  contractYears: number,
) {
  return roundScore(
    clamp(
      45 +
        contractYears *
          11,
    ),
  );
}

export const FreeAgencyOfferScoringService = {
  async scorePlayerOffers(
  params: {
    leagueId: string;
    leaguePlayerId: string;
    client?: ServerSupabaseClient;
  },
) {
    const period =
      await FreeAgencyOfferRepository.getOpenPeriod(
        params.leagueId,
      );

    if (!period) {
      throw new Error(
        "Free Agency is not currently open.",
      );
    }

  const [
  offers,
  profile,
  leaguePlayer,
  settings,
  standings,
  rosterRows,
] = await Promise.all([
  FreeAgencyScoringRepository.getActiveOffersForPlayer(
    {
      leagueId:
        params.leagueId,

      freeAgencyPeriodId:
        period.id,

      leaguePlayerId:
        params.leaguePlayerId,
    },
    params.client,
  ),

  FreeAgencyScoringRepository.getPlayerProfile(
    {
      leagueId:
        params.leagueId,

      leaguePlayerId:
        params.leaguePlayerId,
    },
    params.client,
  ),

  FreeAgencyScoringRepository.getLeaguePlayer(
    {
      leagueId:
        params.leagueId,

      leaguePlayerId:
        params.leaguePlayerId,
    },
    params.client,
  ),

  FreeAgencyScoringRepository.getSettings(
    params.leagueId,
    params.client,
  ),

 StandingService.getLeagueStandings(
  params.leagueId,
  period.season_id,
  params.client,
),

  RosterRepository.getByLeagueAndSeason(
    params.leagueId,
    period.season_id,
    params.client,
  ),
]);

    if (!profile) {
      throw new Error(
        "This player does not have a Free Agency personality profile.",
      );
    }

    if (!leaguePlayer) {
      throw new Error(
        "This league player could not be found.",
      );
    }

    const player =
      unwrapRelation(
        leaguePlayer.players as
          | PlayerRelation
          | PlayerRelation[]
          | null,
      );

    if (
      offers.length === 0
    ) {
      return {
        playerName:
          player?.display_name ??
          player?.full_name ??
          "Unknown Player",

        offers: [],
      };
    }

    const maxTotalValue =
      Math.max(
        ...offers.map(
          (offer) =>
            Number(
              offer.total_value,
            ),
        ),
      );

    const maxAnnualSalary =
      Math.max(
        ...offers.map(
          (offer) =>
            Number(
              offer.year_one_salary,
            ),
        ),
      );

    const winningScores =
      calculateWinningScores(
        standings,
      );

    const randomness =
      Number(
        settings
          ?.free_agency_randomness ??
          0.05,
      );

    const scoredOffers =
      offers.map(
        (offer) => {
          const totalValue =
            Number(
              offer.total_value,
            );

          const annualSalary =
            Number(
              offer.year_one_salary,
            );

          const guaranteedValue =
            Number(
              offer.guaranteed_value,
            );

          const signingBonus =
            Number(
              offer.signing_bonus,
            );

          const contractYears =
            Number(
              offer.contract_years,
            );

          const moneyScore =
            calculateMoneyScore({
              totalValue,
              annualSalary,
              maxTotalValue,
              maxAnnualSalary,
            });

          const securityScore =
            calculateSecurityScore({
              totalValue,
              guaranteedValue,
              signingBonus,
              contractYears,
            });

          const winningScore =
            winningScores.get(
              offer.team_id,
            ) ?? 50;

          const roleScore =
            calculateRoleScore({
              position:
                player?.position ??
                null,

              teamId:
                offer.team_id,

              rosterRows,
            });

          const stabilityScore =
            calculateStabilityScore(
              contractYears,
            );

          const loyaltyScore = 10;

          const baseScore =
            moneyScore *
              Number(
                profile.money_weight,
              ) +
            winningScore *
              Number(
                profile.winning_weight,
              ) +
            roleScore *
              Number(
                profile.role_weight,
              ) +
            securityScore *
              Number(
                profile.security_weight,
              ) +
            stabilityScore *
              Number(
                profile.stability_weight,
              ) +
            loyaltyScore *
              Number(
                profile.loyalty_weight,
              );

          const variance =
            deterministicVariance(
              `${profile.personality_seed}:${offer.id}`,
              randomness,
            );

          const finalScore =
            roundScore(
              clamp(
                baseScore +
                  variance,
              ),
            );

          return {
            offerId:
              offer.id,

            teamId:
              offer.team_id,

            finalScore,

            metadata: {
              engineVersion:
                "v1",

              moneyScore,
              winningScore,
              roleScore,
              securityScore,
              stabilityScore,
              loyaltyScore,

              baseScore:
                roundScore(
                  baseScore,
                ),

              variance:
                roundScore(
                  variance,
                ),

              finalScore,

              personalityWeights: {
                money:
                  Number(
                    profile.money_weight,
                  ),

                winning:
                  Number(
                    profile.winning_weight,
                  ),

                role:
                  Number(
                    profile.role_weight,
                  ),

                security:
                  Number(
                    profile.security_weight,
                  ),

                stability:
                  Number(
                    profile.stability_weight,
                  ),

                loyalty:
                  Number(
                    profile.loyalty_weight,
                  ),
              },
            },
          };
        },
      );

    scoredOffers.sort(
      (a, b) =>
        b.finalScore -
        a.finalScore,
    );

    const ranked =
      scoredOffers.map(
        (
          offer,
          index,
        ) => ({
          offerId:
            offer.offerId,

          score:
            offer.finalScore,

          rank:
            index + 1,

          metadata:
            offer.metadata,
        }),
      );

    await FreeAgencyScoringRepository.saveScores(
  ranked,
  params.client,
);

    return {
      playerName:
        player?.display_name ??
        player?.full_name ??
        "Unknown Player",

      offers:
        ranked,
    };
  },
};
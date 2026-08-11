import { SalaryCapService } from "@/features/salary-cap/services/salary-cap-service";

import {
  FreeAgencyOfferRepository,
  type SalaryStructureYear,
} from "@/features/free-agency/repositories/free-agency-offer-repository";

import { FreeAgencyTeamService } from "@/features/free-agency/services/free-agency-team-service";

type OfferTerms = {
  annualSalary: number;
  contractYears: number;
  guaranteedValue: number;
  signingBonus: number;
};

type SubmitOfferInput = OfferTerms & {
  leagueId: string;
  leaguePlayerId: string;
  userId: string;
};

type UpdateOfferInput = OfferTerms & {
  leagueId: string;
  offerId: string;
  userId: string;
};

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function validateBasicTerms(input: OfferTerms) {
  if (!Number.isFinite(input.annualSalary) || input.annualSalary <= 0) {
    throw new Error("Annual salary must be greater than zero.");
  }

  if (!Number.isInteger(input.contractYears) || input.contractYears < 1) {
    throw new Error("Contract years must be at least 1.");
  }

  if (!Number.isFinite(input.guaranteedValue) || input.guaranteedValue < 0) {
    throw new Error("Guaranteed value cannot be negative.");
  }

  if (!Number.isFinite(input.signingBonus) || input.signingBonus < 0) {
    throw new Error("Signing bonus cannot be negative.");
  }
}

async function buildValidatedTerms(params: {
  leagueId: string;
  teamId: string;
  teamName: string;
  terms: OfferTerms;
}) {
  validateBasicTerms(params.terms);

  const [salaryCap, seasons] = await Promise.all([
    SalaryCapService.getLeagueSalaryCap(params.leagueId),
    FreeAgencyOfferRepository.getLeagueSeasons(params.leagueId),
  ]);

  const teamCap = salaryCap.teams.find(
    (capTeam) => capTeam.teamId === params.teamId,
  );

  if (!teamCap) {
    throw new Error(
      "Salary-cap information could not be found for your team.",
    );
  }

  if (params.terms.contractYears > teamCap.maximumContractYears) {
    throw new Error(
      `This league allows a maximum of ${teamCap.maximumContractYears} contract years per team.`,
    );
  }

  const activeSeason = seasons.find(
    (season) => season.id === salaryCap.currentSeasonId,
  );

  if (!activeSeason) {
    throw new Error("The active league season could not be found.");
  }

  const contractSeasons = seasons
    .filter(
      (season) =>
        Number(season.year) >= Number(activeSeason.year),
    )
    .slice(0, params.terms.contractYears);

  if (contractSeasons.length !== params.terms.contractYears) {
    throw new Error(
      "This league does not have enough future seasons configured for that contract length.",
    );
  }

  const annualSalary = roundCurrency(params.terms.annualSalary);
  const signingBonus = roundCurrency(params.terms.signingBonus);
  const guaranteedValue = roundCurrency(params.terms.guaranteedValue);

  const totalValue = roundCurrency(
    annualSalary * params.terms.contractYears + signingBonus,
  );

  if (guaranteedValue > totalValue) {
    throw new Error(
      "Guaranteed value cannot exceed total contract value.",
    );
  }

  const roundedBaseBonus = roundCurrency(
    signingBonus / params.terms.contractYears,
  );

  const salaryStructure: SalaryStructureYear[] =
    contractSeasons.map((season, index) => {
      const bonus =
        index === 0
          ? roundCurrency(
              signingBonus -
                roundedBaseBonus *
                  (params.terms.contractYears - 1),
            )
          : roundedBaseBonus;

      return {
        seasonId: season.id,
        seasonYear: Number(season.year),
        salary: annualSalary,
        bonus,
      };
    });

  for (const contractSeason of salaryStructure) {
    const existingSeasonCap =
      teamCap.futureCommitments.find(
        (season) =>
          season.seasonId === contractSeason.seasonId,
      );

    const availableCap =
      existingSeasonCap?.capSpace ?? salaryCap.salaryCap;

    const proposedCapHit = roundCurrency(
      contractSeason.salary + contractSeason.bonus,
    );

    if (proposedCapHit > availableCap) {
      throw new Error(
        `${params.teamName} does not have enough projected cap space in ${contractSeason.seasonYear}. Available: ${availableCap}. Proposed cap hit: ${proposedCapHit}.`,
      );
    }
  }

  return {
    salaryCap,
    teamCap,
    annualSalary,
    guaranteedValue,
    signingBonus,
    totalValue,
    salaryStructure,
  };
}

export const FreeAgencyOfferService = {
  async getMyOffers(params: {
    leagueId: string;
    userId: string;
  }) {
    const team =
      await FreeAgencyTeamService.findOwnedTeam({
        leagueId: params.leagueId,
        userId: params.userId,
      });

    if (!team) {
      return {
        team: null,
        offers: [],
      };
    }

    const rows =
      await FreeAgencyOfferRepository.getActiveByTeam({
        leagueId: params.leagueId,
        teamId: team.teamId,
      });

    const offers = rows.map((row) => {
      const leaguePlayer = Array.isArray(row.league_players)
        ? row.league_players[0] ?? null
        : row.league_players;

      const playerRelation = leaguePlayer?.players;

      const player = Array.isArray(playerRelation)
        ? playerRelation[0] ?? null
        : playerRelation;

      return {
        id: row.id,
        leaguePlayerId: row.league_player_id,
        playerName:
          player?.display_name ??
          player?.full_name ??
          "Unknown Player",
        position: player?.position ?? null,
        proTeam: player?.pro_team ?? null,
        contractYears: Number(row.contract_years),
        annualSalary: Number(row.year_one_salary),
        guaranteedValue: Number(row.guaranteed_value),
        signingBonus: Number(row.signing_bonus),
        totalValue: Number(row.total_value),
        submittedAt: row.submitted_at,
      };
    });

    return {
      team: {
        id: team.teamId,
        name: team.teamName,
      },
      offers,
    };
  },

  async submitOffer(input: SubmitOfferInput) {
    const [team, period, freeAgent] = await Promise.all([
      FreeAgencyTeamService.resolveOwnedTeam({
        leagueId: input.leagueId,
        userId: input.userId,
      }),
      FreeAgencyOfferRepository.getOpenPeriod(input.leagueId),
      FreeAgencyOfferRepository.getFreeAgent({
        leagueId: input.leagueId,
        leaguePlayerId: input.leaguePlayerId,
      }),
    ]);

    if (!period) {
      throw new Error("Free Agency is not currently open.");
    }

    if (!freeAgent) {
      throw new Error(
        "This player could not be found in the league.",
      );
    }

    if (
      freeAgent.status !== "free_agent" ||
      freeAgent.current_team_id
    ) {
      throw new Error(
        "This player is no longer a free agent.",
      );
    }

    const validated = await buildValidatedTerms({
      leagueId: input.leagueId,
      teamId: team.teamId,
      teamName: team.teamName,
      terms: input,
    });

    const existingOffer =
      await FreeAgencyOfferRepository.getExistingActiveOffer({
        freeAgencyPeriodId: period.id,
        leaguePlayerId: input.leaguePlayerId,
        teamId: team.teamId,
      });

    if (existingOffer) {
      throw new Error(
        "Your team already has an active offer for this player. Edit the existing offer instead.",
      );
    }

    const offer = await FreeAgencyOfferRepository.create({
      leagueId: input.leagueId,
      seasonId: period.season_id,
      freeAgencyPeriodId: period.id,
      leaguePlayerId: input.leaguePlayerId,
      teamId: team.teamId,
      contractYears: input.contractYears,
      totalValue: validated.totalValue,
      guaranteedValue: validated.guaranteedValue,
      signingBonus: validated.signingBonus,
      yearOneSalary: validated.annualSalary,
      salaryStructure: validated.salaryStructure,
      submittedBy: input.userId,
    });

    return {
      offer,
      team: {
        id: team.teamId,
        name: team.teamName,
      },
      cap: {
        salaryCap: validated.teamCap.salaryCap,
        currentCommitted: validated.teamCap.currentCommitted,
        currentCapSpace: validated.teamCap.currentCapSpace,
      },
    };
  },

  async updateOffer(input: UpdateOfferInput) {
    const [team, period, existingOffer] = await Promise.all([
      FreeAgencyTeamService.resolveOwnedTeam({
        leagueId: input.leagueId,
        userId: input.userId,
      }),
      FreeAgencyOfferRepository.getOpenPeriod(input.leagueId),
      FreeAgencyOfferRepository.getById({
        leagueId: input.leagueId,
        offerId: input.offerId,
      }),
    ]);

    if (!period) {
      throw new Error("Free Agency is not currently open.");
    }

    if (!existingOffer) {
      throw new Error("This offer could not be found.");
    }

    if (existingOffer.status !== "active") {
      throw new Error("Only active offers can be edited.");
    }

    if (existingOffer.team_id !== team.teamId) {
      throw new Error("You cannot edit another team's offer.");
    }

    if (existingOffer.free_agency_period_id !== period.id) {
      throw new Error(
        "This offer belongs to a different Free Agency period.",
      );
    }

    const freeAgent =
      await FreeAgencyOfferRepository.getFreeAgent({
        leagueId: input.leagueId,
        leaguePlayerId: existingOffer.league_player_id,
      });

    if (
      !freeAgent ||
      freeAgent.status !== "free_agent" ||
      freeAgent.current_team_id
    ) {
      throw new Error(
        "This player is no longer a free agent.",
      );
    }

    const validated = await buildValidatedTerms({
      leagueId: input.leagueId,
      teamId: team.teamId,
      teamName: team.teamName,
      terms: input,
    });

    const offer =
      await FreeAgencyOfferRepository.updateActive({
        offerId: existingOffer.id,
        teamId: team.teamId,
        contractYears: input.contractYears,
        totalValue: validated.totalValue,
        guaranteedValue: validated.guaranteedValue,
        signingBonus: validated.signingBonus,
        yearOneSalary: validated.annualSalary,
        salaryStructure: validated.salaryStructure,
      });

    return { offer, team };
  },

  async withdrawOffer(params: {
    leagueId: string;
    offerId: string;
    userId: string;
  }) {
    const [team, period, existingOffer] = await Promise.all([
      FreeAgencyTeamService.resolveOwnedTeam({
        leagueId: params.leagueId,
        userId: params.userId,
      }),
      FreeAgencyOfferRepository.getOpenPeriod(params.leagueId),
      FreeAgencyOfferRepository.getById({
        leagueId: params.leagueId,
        offerId: params.offerId,
      }),
    ]);

    if (!period) {
      throw new Error("Free Agency is not currently open.");
    }

    if (!existingOffer) {
      throw new Error("This offer could not be found.");
    }

    if (existingOffer.status !== "active") {
      throw new Error("Only active offers can be withdrawn.");
    }

    if (existingOffer.team_id !== team.teamId) {
      throw new Error(
        "You cannot withdraw another team's offer.",
      );
    }

    return FreeAgencyOfferRepository.withdrawActive({
      offerId: existingOffer.id,
      teamId: team.teamId,
    });
  },
};
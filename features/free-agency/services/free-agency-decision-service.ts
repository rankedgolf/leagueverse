import { createClient } from "@/lib/supabase/server";

import { FreeAgencyDecisionRepository } from "@/features/free-agency/repositories/free-agency-decision-repository";
import { FreeAgencyOfferScoringService } from "@/features/free-agency/services/free-agency-offer-scoring-service";
import { FreeAgencyOfferRepository } from "@/features/free-agency/repositories/free-agency-offer-repository";

import { TransactionBuilder } from "@/features/transactions/builders/transaction-builder";
import { TransactionRepository } from "@/features/transactions/repositories/transaction-repository";

import type { ServerSupabaseClient } from "@/lib/supabase/types";

function unwrapRelation<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export const FreeAgencyDecisionService = {
  async runDecision(params: {
  leagueId: string;
  leaguePlayerId: string;
  createdBy?: string | null;
  client?: ServerSupabaseClient;
}) {
    const period =
      await FreeAgencyOfferRepository.getOpenPeriod(
        params.leagueId,
      );

    if (!period) {
      throw new Error(
        "Free Agency is not currently open.",
      );
    }

const existingDecisionClient =
  params.client ??
  (await createClient());

    const {
      data: existingDecision,
      error: existingDecisionError,
    } =
      await existingDecisionClient
        .from("free_agency_decisions")
        .select(`
          id,
          winning_offer_id,
          transaction_id
        `)
        .eq(
          "free_agency_period_id",
          period.id,
        )
        .eq(
          "league_player_id",
          params.leaguePlayerId,
        )
        .maybeSingle();

    if (existingDecisionError) {
      throw new Error(
        existingDecisionError.message,
      );
    }

    if (existingDecision) {
      throw new Error(
        "A decision has already been recorded for this player in the current Free Agency period.",
      );
    }

   const scored =
  await FreeAgencyOfferScoringService.scorePlayerOffers(
    {
      leagueId:
        params.leagueId,

      leaguePlayerId:
        params.leaguePlayerId,

      client:
        params.client,
    },
  );

    if (
      scored.offers.length === 0
    ) {
      throw new Error(
        "This player does not have any active offers.",
      );
    }

    const winningScore =
      scored.offers[0];

    if (!winningScore) {
      throw new Error(
        "Unable to determine a winning offer.",
      );
    }

const winningOffer =
  await FreeAgencyDecisionRepository.getOffer(
    winningScore.offerId,
    params.client,
  );

    if (!winningOffer) {
      throw new Error(
        "The winning offer could not be found.",
      );
    }

    if (
      winningOffer.status !==
      "active"
    ) {
      throw new Error(
        "The winning offer is no longer active.",
      );
    }

  const leaguePlayer =
  await FreeAgencyDecisionRepository.getLeaguePlayer(
    {
      leagueId:
        params.leagueId,

      leaguePlayerId:
        params.leaguePlayerId,
    },
    params.client,
  );

    if (!leaguePlayer) {
      throw new Error(
        "The league player could not be found.",
      );
    }

    if (
      leaguePlayer.status !==
        "free_agent" ||
      leaguePlayer.current_team_id
    ) {
      throw new Error(
        "This player is no longer a free agent.",
      );
    }

    const player =
      unwrapRelation(
        leaguePlayer.players,
      );

    const playerName =
      player?.display_name ??
      player?.full_name ??
      "Free Agent";

    const salaryStructure =
      Array.isArray(
        winningOffer.salary_structure,
      )
        ? winningOffer.salary_structure
        : [];

    if (
      salaryStructure.length !==
      Number(
        winningOffer.contract_years,
      )
    ) {
      throw new Error(
        "The winning offer has an invalid salary structure.",
      );
    }

    const built =
      TransactionBuilder.freeAgentSigning(
        {
          leagueId:
            params.leagueId,

          seasonId:
            winningOffer.season_id,

          createdBy:
            params.createdBy ??
            null,

          teamId:
            winningOffer.team_id,

          playerId:
            leaguePlayer.player_id,

          leaguePlayerId:
            leaguePlayer.id,

          playerName,

          contractYears:
            Number(
              winningOffer.contract_years,
            ),

          totalValue:
            Number(
              winningOffer.total_value,
            ),

          guaranteedValue:
            Number(
              winningOffer.guaranteed_value,
            ),

          signingBonus:
            Number(
              winningOffer.signing_bonus,
            ),

          yearOneSalary:
            Number(
              winningOffer.year_one_salary,
            ),

          salaryStructure:
            salaryStructure.map(
              (row) => ({
                seasonId:
                  String(
                    row.seasonId,
                  ),

                seasonYear:
                  Number(
                    row.seasonYear,
                  ),

                salary:
                  Number(
                    row.salary,
                  ),

                bonus:
                  Number(
                    row.bonus,
                  ),
              }),
            ),

          freeAgencyOfferId:
            winningOffer.id,

          freeAgencyPeriodId:
            period.id,

          notes:
            `${playerName} accepted a LeagueVerse Free Agency offer.`,
        },
      );

    const transaction =
  await TransactionRepository.create(
    built.transaction,
    params.client,
  );

   await FreeAgencyDecisionRepository.acceptOffer(
  winningOffer.id,
  params.client,
);

    await FreeAgencyDecisionRepository.declineOtherOffers(
  {
    leagueId:
      params.leagueId,

    freeAgencyPeriodId:
      period.id,

    leaguePlayerId:
      params.leaguePlayerId,

    winningOfferId:
      winningOffer.id,
  },
  params.client,
);

   const supabase =
  params.client ??
  (await createClient());

    const {
      data: decision,
      error: decisionError,
    } =
      await supabase
        .from(
          "free_agency_decisions",
        )
        .insert({
          league_id:
            params.leagueId,

          season_id:
            period.season_id,

          free_agency_period_id:
            period.id,

          league_player_id:
            params.leaguePlayerId,

          winning_offer_id:
            winningOffer.id,

          transaction_id:
            transaction.id,

          decision_type:
            "automated",

          decision_score:
            winningScore.score,

          randomness_applied:
            Number(
              winningOffer
                .decision_metadata
                ?.variance ??
                0,
            ),

          explanation:
            {
              engineVersion:
                "v1",

              winningOfferId:
                winningOffer.id,

              winningTeamId:
                winningOffer.team_id,

              winningScore:
                winningScore.score,

              decisionRank:
                winningOffer.decision_rank,

              playerName,
            },

          decided_at:
            new Date().toISOString(),
        })
        .select(`
          id,
          winning_offer_id,
          transaction_id,
          decision_score,
          decided_at
        `)
        .single();

    if (decisionError) {
      throw new Error(
        decisionError.message,
      );
    }

    return {
      playerName,

      winningOfferId:
        winningOffer.id,

      winningTeamId:
        winningOffer.team_id,

      winningScore:
        winningScore.score,

      transactionId:
        transaction.id,

      decision,
    };
  },
};
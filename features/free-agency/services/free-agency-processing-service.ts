import { FreeAgencyDecisionService } from "@/features/free-agency/services/free-agency-decision-service";

import { FreeAgencyProcessingRepository } from "@/features/free-agency/repositories/free-agency-processing-repository";

import type { ServerSupabaseClient } from "@/lib/supabase/types";

export const FreeAgencyProcessingService = {
  async processDueDecisions(params: {
    leagueId: string;
    periodId: string;
    createdBy?: string | null;
    force?: boolean;
    client?: ServerSupabaseClient;
  }) {
    const period =
      await FreeAgencyProcessingRepository.getPeriod(
        params.periodId,
        params.client,
      );

    if (!period) {
      throw new Error(
        "Free Agency period could not be found.",
      );
    }

    if (
      period.league_id !==
      params.leagueId
    ) {
      throw new Error(
        "Free Agency period does not belong to this league.",
      );
    }

    if (
      period.status !== "open"
    ) {
      throw new Error(
        "Free Agency period is not open.",
      );
    }

    const now = new Date();

    if (
      period.decisions_begin_at &&
      now <
        new Date(
          period.decisions_begin_at,
        )
    ) {
      throw new Error(
        "The Free Agency decision window has not started yet.",
      );
    }

    if (
      period.decisions_end_at &&
      now >
        new Date(
          period.decisions_end_at,
        )
    ) {
      throw new Error(
        "The Free Agency decision window has ended.",
      );
    }

    if (
      !params.force &&
      period.next_decision_at &&
      now <
        new Date(
          period.next_decision_at,
        )
    ) {
      return {
        processed: false,
        reason: "not_due",
        decisionsCreated: 0,
        failures: [],
        nextDecisionAt:
          period.next_decision_at,
      };
    }

    const [
      playerIds,
      decidedPlayerIds,
    ] = await Promise.all([
      FreeAgencyProcessingRepository.getPlayersWithActiveOffers(
        {
          leagueId:
            params.leagueId,

          periodId:
            params.periodId,
        },
        params.client,
      ),

      FreeAgencyProcessingRepository.getDecidedPlayerIds(
        params.periodId,
        params.client,
      ),
    ]);

    const eligiblePlayerIds =
      playerIds.filter(
        (leaguePlayerId) =>
          !decidedPlayerIds.has(
            leaguePlayerId,
          ),
      );

    const results: Array<{
      leaguePlayerId: string;
      success: boolean;
      error?: string;
    }> = [];

    for (
      const leaguePlayerId
      of eligiblePlayerIds
    ) {
      try {
        await FreeAgencyDecisionService.runDecision(
          {
            leagueId:
              params.leagueId,

            leaguePlayerId,

            createdBy:
              params.createdBy ??
              null,

            client:
              params.client,
          },
        );

        results.push({
          leaguePlayerId,
          success: true,
        });
      } catch (error) {
        results.push({
          leaguePlayerId,
          success: false,

          error:
            error instanceof Error
              ? error.message
              : "Unknown Free Agency processing error.",
        });
      }
    }

    const frequencyHours =
      Number(
        period.decision_frequency_hours ??
          24,
      );

    const schedule =
      await FreeAgencyProcessingRepository.markProcessed(
        {
          periodId:
            params.periodId,

          processedAt:
            now,

          frequencyHours,
        },
        params.client,
      );

    const failures =
      results.filter(
        (result) =>
          !result.success,
      );

    return {
      processed: true,

      eligiblePlayers:
        eligiblePlayerIds.length,

      decisionsCreated:
        results.length -
        failures.length,

      failures,

      nextDecisionAt:
        schedule.nextDecisionAt,
    };
  },
};

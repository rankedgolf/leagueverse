import { createAdminClient } from "@/lib/supabase/admin";

import { FreeAgencyCronRepository } from "@/features/free-agency/repositories/free-agency-cron-repository";
import { FreeAgencyProcessingService } from "@/features/free-agency/services/free-agency-processing-service";

export const FreeAgencyCronService = {
  async processDuePeriods() {
    const adminClient =
      createAdminClient();

    const duePeriods =
      await FreeAgencyCronRepository.getDuePeriods(
        adminClient,
      );

    const results: Array<{
      periodId: string;
      leagueId: string;
      success: boolean;
      decisionsCreated?: number;
      failureCount?: number;
      error?: string;
    }> = [];

    for (
      const period
      of duePeriods
    ) {
      try {
        const result =
          await FreeAgencyProcessingService.processDueDecisions(
            {
              leagueId:
                period.league_id,

              periodId:
                period.id,

              createdBy: null,

              force: false,

              client:
                adminClient,
            },
          );

        results.push({
          periodId:
            period.id,

          leagueId:
            period.league_id,

          success: true,

          decisionsCreated:
            result.decisionsCreated,

          failureCount:
            result.failures.length,
        });
      } catch (error) {
        results.push({
          periodId:
            period.id,

          leagueId:
            period.league_id,

          success: false,

          error:
            error instanceof Error
              ? error.message
              : "Unknown Free Agency cron error.",
        });
      }
    }

    return {
      duePeriodCount:
        duePeriods.length,

      successfulPeriodCount:
        results.filter(
          (result) =>
            result.success,
        ).length,

      failedPeriodCount:
        results.filter(
          (result) =>
            !result.success,
        ).length,

      results,
    };
  },
};
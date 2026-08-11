"use server";

import { revalidatePath } from "next/cache";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

import {
  FreeAgencyPeriodService,
  type FreeAgencyPeriodStatus,
} from "@/features/free-agency/services/free-agency-period-service";

type UpdateFreeAgencyPeriodInput =
  | {
      leagueId: string;
      periodId: string;
      action: "pause" | "resume" | "close";
    }
  | {
      leagueId: string;
      periodId: string;
      action: "frequency";
      frequencyHours: number;
    };

export async function updateFreeAgencyPeriod(
  input: UpdateFreeAgencyPeriodInput,
) {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  if (input.action === "frequency") {
    const result =
      await FreeAgencyPeriodService.updateDecisionFrequency({
        leagueId: input.leagueId,
        periodId: input.periodId,
        frequencyHours: input.frequencyHours,
      });

    revalidatePath(
      `/leagues/${input.leagueId}/free-agency`,
    );

    return result;
  }

  const statusByAction: Record<
    "pause" | "resume" | "close",
    FreeAgencyPeriodStatus
  > = {
    pause: "paused",
    resume: "open",
    close: "closed",
  };

  const result =
    await FreeAgencyPeriodService.updateStatus({
      leagueId: input.leagueId,
      periodId: input.periodId,
      status: statusByAction[input.action],
    });

  revalidatePath(
    `/leagues/${input.leagueId}/free-agency`,
  );

  return result;
}
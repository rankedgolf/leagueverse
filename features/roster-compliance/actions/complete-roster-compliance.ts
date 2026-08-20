"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

import { RosterComplianceService } from "@/features/roster-compliance/services/roster-compliance-service";

type CompleteRosterComplianceInput = {
  leagueId: string;
  operationSeasonId: string;
};

export async function completeRosterCompliance(
  input: CompleteRosterComplianceInput,
) {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  const compliance =
    await RosterComplianceService.getCompliance({
      leagueId: input.leagueId,
    });

  if (!compliance.allCompliant) {
    throw new Error(
      `${compliance.nonCompliantTeams} team${
        compliance.nonCompliantTeams === 1
          ? ""
          : "s"
      } must become compliant before this phase can be completed.`,
    );
  }

  const supabase =
    await createClient();

  const now =
    new Date().toISOString();

  const {
    error,
  } =
    await supabase
      .from("league_operation_periods")
      .upsert(
        {
          league_id:
            input.leagueId,

          season_id:
            input.operationSeasonId,

          phase:
            "roster_compliance",

          status:
            "completed",

          processed_at:
            now,

          closed_at:
            now,

          updated_at:
            now,
        },
        {
          onConflict:
            "league_id,season_id,phase",
        },
      );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  revalidatePath(
    `/leagues/${input.leagueId}/operations`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/rosters`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/salary-cap`,
  );

  return {
    success: true,

    seasonId:
      compliance.seasonId,

    seasonName:
      compliance.seasonName,

    totalTeams:
      compliance.totalTeams,

    compliantTeams:
      compliance.compliantTeams,
  };
}
"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

type ProcessContractExpirationsInput = {
  leagueId: string;
  seasonId: string;
};

type ProcessContractExpirationsResult = {
  success: boolean;
  leagueId: string;
  seasonId: string;
  expiringCount: number;
  taggedCount: number;
  freeAgentCount: number;
  processedAt: string;
};

export async function processContractExpirations(
  input: ProcessContractExpirationsInput,
): Promise<ProcessContractExpirationsResult> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  const supabase =
    await createClient();

  const { data, error } =
    await supabase.rpc(
      "process_contract_expirations",
      {
        p_league_id:
          input.leagueId,

        p_season_id:
          input.seasonId,
      },
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  const result =
    data as ProcessContractExpirationsResult | null;

  if (
    !result ||
    result.success !== true
  ) {
    throw new Error(
      "Contract expiration processing did not complete successfully.",
    );
  }

  revalidatePath(
    `/leagues/${input.leagueId}/operations`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/rosters`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/contracts`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/free-agency`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/salary-cap`,
  );

  return result;
}
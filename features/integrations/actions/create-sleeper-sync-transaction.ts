"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import {
  SleeperSyncTransactionService,
  type CreateSleeperSyncTransactionsResult,
} from "@/features/integrations/services/sleeper-sync-transaction-service";

type CreateSleeperSyncTransactionsInput = {
  leagueId: string;
};

export async function createSleeperSyncTransactions(
  input: CreateSleeperSyncTransactionsInput,
): Promise<CreateSleeperSyncTransactionsResult> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be signed in to create transactions.",
    );
  }

  const result =
    await SleeperSyncTransactionService.createPendingTransactions(
      {
        leagueId: input.leagueId,
        createdBy: user.id,
      },
    );

  revalidatePath(
    `/leagues/${input.leagueId}/transactions`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/integrations/sleeper/sync`,
  );

  return result;
}
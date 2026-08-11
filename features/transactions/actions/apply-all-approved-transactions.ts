"use server";

import { revalidatePath } from "next/cache";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import {
  TransactionApplicationService,
  type BulkTransactionApplicationResult,
} from "@/features/transactions/services/transaction-application-service";

type ApplyAllApprovedTransactionsInput = {
  leagueId: string;
};

export async function applyAllApprovedTransactions(
  input: ApplyAllApprovedTransactionsInput,
): Promise<BulkTransactionApplicationResult> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  const result =
    await TransactionApplicationService.applyAllApproved({
      leagueId: input.leagueId,
    });

  revalidatePath(
    `/leagues/${input.leagueId}/transactions`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/players`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/rosters`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/contracts`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/salary-cap`,
  );

  revalidatePath(
    `/leagues/${input.leagueId}/integrations/sleeper/sync`,
  );

  return result;
}
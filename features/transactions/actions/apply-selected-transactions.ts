"use server";

import { revalidatePath } from "next/cache";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import {
  TransactionApplicationService,
  type BulkTransactionApplicationResult,
} from "@/features/transactions/services/transaction-application-service";

type ApplySelectedTransactionsInput = {
  leagueId: string;
  transactionIds: string[];
};

export async function applySelectedTransactions(
  input: ApplySelectedTransactionsInput,
): Promise<BulkTransactionApplicationResult> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  if (input.transactionIds.length === 0) {
    throw new Error(
      "Select at least one approved transaction.",
    );
  }

  const result =
    await TransactionApplicationService.applySelected({
      leagueId: input.leagueId,
      transactionIds:
        input.transactionIds,
    });

  revalidateTransactionPaths(
    input.leagueId,
  );

  return result;
}

function revalidateTransactionPaths(
  leagueId: string,
) {
  revalidatePath(
    `/leagues/${leagueId}/transactions`,
  );

  revalidatePath(
    `/leagues/${leagueId}/players`,
  );

  revalidatePath(
    `/leagues/${leagueId}/rosters`,
  );

  revalidatePath(
    `/leagues/${leagueId}/contracts`,
  );

  revalidatePath(
    `/leagues/${leagueId}/salary-cap`,
  );

  revalidatePath(
    `/leagues/${leagueId}/integrations/sleeper/sync`,
  );
}
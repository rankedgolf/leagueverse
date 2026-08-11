"use server";

import { revalidatePath } from "next/cache";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import type { TransactionApplicationResultDTO } from "@/features/transactions/dto/transaction-application-dto";
import { TransactionApplicationService } from "@/features/transactions/services/transaction-application-service";

type ApplyTransactionInput = {
  leagueId: string;
  transactionId: string;
};

export async function applyTransaction(
  input: ApplyTransactionInput,
): Promise<TransactionApplicationResultDTO> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  const result =
    await TransactionApplicationService.apply({
      leagueId: input.leagueId,
      transactionId:
        input.transactionId,
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
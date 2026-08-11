"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import type { TransactionDTO } from "@/features/transactions/dto/transaction-dto";
import { TransactionReviewService } from "@/features/transactions/services/transaction-review-service";

type ApproveAllTransactionsInput = {
  leagueId: string;
};

export async function approveAllTransactions(
  input: ApproveAllTransactionsInput,
): Promise<TransactionDTO[]> {
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
      "You must be signed in to approve transactions.",
    );
  }

  const transactions =
    await TransactionReviewService.approveAll({
      leagueId: input.leagueId,
      reviewedBy: user.id,
    });

  revalidatePath(
    `/leagues/${input.leagueId}/transactions`,
  );

  return transactions;
}
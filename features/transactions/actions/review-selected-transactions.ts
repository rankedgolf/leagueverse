"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import type { TransactionDTO } from "@/features/transactions/dto/transaction-dto";
import { TransactionReviewService } from "@/features/transactions/services/transaction-review-service";

type ReviewSelectedTransactionsInput = {
  leagueId: string;
  transactionIds: string[];
  action: "approve" | "reject";
};

export async function reviewSelectedTransactions(
  input: ReviewSelectedTransactionsInput,
): Promise<TransactionDTO[]> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  if (input.transactionIds.length === 0) {
    throw new Error(
      "Select at least one transaction.",
    );
  }

  const uniqueTransactionIds = Array.from(
    new Set(input.transactionIds),
  );

  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error(
      "You must be signed in to review transactions.",
    );
  }

  const transactions =
    input.action === "approve"
      ? await TransactionReviewService.approveSelected({
          leagueId: input.leagueId,
          transactionIds:
            uniqueTransactionIds,
          reviewedBy: user.id,
        })
      : await TransactionReviewService.rejectSelected({
          leagueId: input.leagueId,
          transactionIds:
            uniqueTransactionIds,
          reviewedBy: user.id,
        });

  revalidatePath(
    `/leagues/${input.leagueId}/transactions`,
  );

  return transactions;
}
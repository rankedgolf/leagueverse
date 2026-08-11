import { createClient } from "@/lib/supabase/server";

import type { TransactionApplicationResultDTO } from "@/features/transactions/dto/transaction-application-dto";

type ApplyTransactionRpcRow = {
  success?: boolean;
  transactionId?: string;
  leagueId?: string;
  appliedItems?: number;
  completedAt?: string;
  error?: string;
};

export const TransactionApplicationRepository = {
  async apply(params: {
    leagueId: string;
    transactionId: string;
  }): Promise<TransactionApplicationResultDTO> {
    const supabase = await createClient();

    const { data, error } = await supabase.rpc(
      "apply_league_transaction",
      {
        p_league_id: params.leagueId,
        p_transaction_id:
          params.transactionId,
      },
    );

    if (error) {
      throw new Error(error.message);
    }

    const result =
      data as ApplyTransactionRpcRow | null;

    if (!result) {
      throw new Error(
        "The transaction application returned no result.",
      );
    }

    return {
      success: result.success === true,
      transactionId:
        result.transactionId ??
        params.transactionId,
      leagueId:
        result.leagueId ??
        params.leagueId,
      appliedItems:
        Number(result.appliedItems ?? 0),
      completedAt:
        result.completedAt,
      error: result.error,
    };
  },
};
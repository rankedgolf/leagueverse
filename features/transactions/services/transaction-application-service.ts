import type { TransactionApplicationResultDTO } from "@/features/transactions/dto/transaction-application-dto";
import { TransactionApplicationRepository } from "@/features/transactions/repositories/transaction-application-repository";
import { TransactionRepository } from "@/features/transactions/repositories/transaction-repository";

type ApplyTransactionInput = {
  leagueId: string;
  transactionId: string;
};

export type BulkTransactionApplicationResult = {
  attemptedCount: number;
  completedCount: number;
  failedCount: number;

  results: TransactionApplicationResultDTO[];

  errors: {
    transactionId: string;
    message: string;
  }[];
};

async function applySingleTransaction({
  leagueId,
  transactionId,
}: ApplyTransactionInput): Promise<TransactionApplicationResultDTO> {
  const transaction =
    await TransactionRepository.getById({
      leagueId,
      transactionId,
    });

  if (!transaction) {
    throw new Error(
      "The transaction could not be found.",
    );
  }

  if (transaction.status !== "approved") {
    throw new Error(
      `Only approved transactions can be applied. This transaction is currently ${transaction.status}.`,
    );
  }

  const result =
    await TransactionApplicationRepository.apply({
      leagueId,
      transactionId,
    });

  if (!result.success) {
    throw new Error(
      result.error ??
        "The transaction could not be applied.",
    );
  }

  return result;
}

export const TransactionApplicationService = {
  async apply(
    input: ApplyTransactionInput,
  ): Promise<TransactionApplicationResultDTO> {
    return applySingleTransaction(input);
  },

  async applySelected(params: {
    leagueId: string;
    transactionIds: string[];
  }): Promise<BulkTransactionApplicationResult> {
    const uniqueTransactionIds = Array.from(
      new Set(params.transactionIds),
    );

    if (uniqueTransactionIds.length === 0) {
      return {
        attemptedCount: 0,
        completedCount: 0,
        failedCount: 0,
        results: [],
        errors: [],
      };
    }

    const results: TransactionApplicationResultDTO[] =
      [];

    const errors: {
      transactionId: string;
      message: string;
    }[] = [];

    for (const transactionId of
      uniqueTransactionIds) {
      try {
        const result =
          await applySingleTransaction({
            leagueId: params.leagueId,
            transactionId,
          });

        results.push(result);
      } catch (error) {
        errors.push({
          transactionId,
          message:
            error instanceof Error
              ? error.message
              : "Transaction application failed.",
        });
      }
    }

    return {
      attemptedCount:
        uniqueTransactionIds.length,

      completedCount:
        results.length,

      failedCount:
        errors.length,

      results,
      errors,
    };
  },

  async applyAllApproved(params: {
    leagueId: string;
  }): Promise<BulkTransactionApplicationResult> {
    const approvedTransactions =
      await TransactionRepository.listByLeague({
        leagueId: params.leagueId,
        status: "approved",
        limit: 500,
      });

    return this.applySelected({
      leagueId: params.leagueId,
      transactionIds:
        approvedTransactions.map(
          (transaction) =>
            transaction.id,
        ),
    });
  },
};
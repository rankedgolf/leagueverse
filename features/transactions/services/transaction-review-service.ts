import type {
  TransactionDTO,
  TransactionStatus,
} from "@/features/transactions/dto/transaction-dto";
import { TransactionRepository } from "@/features/transactions/repositories/transaction-repository";

type ReviewTransactionInput = {
  leagueId: string;
  transactionId: string;
  reviewedBy: string;
};

function requirePendingTransaction(
  transaction: TransactionDTO | null,
): asserts transaction is TransactionDTO {
  if (!transaction) {
    throw new Error(
      "The transaction could not be found.",
    );
  }

  if (transaction.status !== "pending") {
    throw new Error(
      `Only pending transactions can be reviewed. This transaction is currently ${transaction.status}.`,
    );
  }
}

async function updateReviewedTransaction(params: {
  leagueId: string;
  transactionId: string;
  reviewedBy: string;
  status: Extract<
    TransactionStatus,
    "approved" | "rejected"
  >;
}): Promise<TransactionDTO> {
  const transaction =
    await TransactionRepository.getById({
      leagueId: params.leagueId,
      transactionId: params.transactionId,
    });

  requirePendingTransaction(transaction);

  return TransactionRepository.updateStatus({
    leagueId: params.leagueId,
    transactionId: params.transactionId,
    status: params.status,
    approvedBy:
      params.status === "approved"
        ? params.reviewedBy
        : undefined,
  });
}

export const TransactionReviewService = {
  async approve(
    input: ReviewTransactionInput,
  ): Promise<TransactionDTO> {
    return updateReviewedTransaction({
      ...input,
      status: "approved",
    });
  },

  async reject(
    input: ReviewTransactionInput,
  ): Promise<TransactionDTO> {
    return updateReviewedTransaction({
      ...input,
      status: "rejected",
    });
  },

  async approveAll(params: {
    leagueId: string;
    reviewedBy: string;
  }): Promise<TransactionDTO[]> {
    const pendingTransactions =
      await TransactionRepository.listByLeague({
        leagueId: params.leagueId,
        status: "pending",
        limit: 500,
      });

    if (pendingTransactions.length === 0) {
      return [];
    }

    const approvedTransactions: TransactionDTO[] =
      [];

    for (const transaction of pendingTransactions) {
      const approvedTransaction =
        await TransactionRepository.updateStatus({
          leagueId: params.leagueId,
          transactionId: transaction.id,
          status: "approved",
          approvedBy: params.reviewedBy,
        });

      approvedTransactions.push(
        approvedTransaction,
      );
    }

    return approvedTransactions;
  },

  async approveSelected(params: {
    leagueId: string;
    transactionIds: string[];
    reviewedBy: string;
  }): Promise<TransactionDTO[]> {
    if (params.transactionIds.length === 0) {
      return [];
    }

    const approvedTransactions: TransactionDTO[] =
      [];

    for (const transactionId of
      params.transactionIds) {
      const transaction =
        await TransactionRepository.getById({
          leagueId: params.leagueId,
          transactionId,
        });

      requirePendingTransaction(transaction);

      const approvedTransaction =
        await TransactionRepository.updateStatus({
          leagueId: params.leagueId,
          transactionId,
          status: "approved",
          approvedBy: params.reviewedBy,
        });

      approvedTransactions.push(
        approvedTransaction,
      );
    }

    return approvedTransactions;
  },

  async rejectSelected(params: {
    leagueId: string;
    transactionIds: string[];
    reviewedBy: string;
  }): Promise<TransactionDTO[]> {
    if (params.transactionIds.length === 0) {
      return [];
    }

    const rejectedTransactions: TransactionDTO[] =
      [];

    for (const transactionId of
      params.transactionIds) {
      const transaction =
        await TransactionRepository.getById({
          leagueId: params.leagueId,
          transactionId,
        });

      requirePendingTransaction(transaction);

      const rejectedTransaction =
        await TransactionRepository.updateStatus({
          leagueId: params.leagueId,
          transactionId,
          status: "rejected",
        });

      rejectedTransactions.push(
        rejectedTransaction,
      );
    }

    return rejectedTransactions;
  },
};
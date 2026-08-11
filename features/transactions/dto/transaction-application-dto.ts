export type TransactionApplicationResultDTO = {
  success: boolean;
  transactionId: string;
  leagueId: string;
  appliedItems: number;
  completedAt?: string;
  error?: string;
};
export type TransactionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "applying"
  | "completed"
  | "failed"
  | "cancelled";

export type TransactionSource =
  | "manual"
  | "sleeper_sync"
  | "yahoo_sync"
  | "espn_sync"
  | "import"
  | "system";

export type TransactionProvider =
  | "sleeper"
  | "yahoo"
  | "espn"
  | null;

export type TransactionRosterAction =
  | "add"
  | "drop"
  | "move"
  | "keep"
  | null;

export type TransactionContractAction =
  | "create"
  | "transfer"
  | "terminate"
  | "retain"
  | "none"
  | null;

export type TransactionItemDTO = {
  id: string;
  transactionId: string;
  leagueId: string;

  fromTeamId: string | null;
  toTeamId: string | null;

  playerId: string | null;
  leaguePlayerId: string | null;
  contractId: string | null;
  draftPickId: string | null;

  itemType: string;

  rosterAction: TransactionRosterAction;
  contractAction: TransactionContractAction;

  salaryBefore: number | null;
  salaryAfter: number | null;

  metadata: Record<string, unknown>;

  createdAt: string;
};

export type TransactionDTO = {
  id: string;

  leagueId: string;
  seasonId: string | null;

  type: string;
  status: TransactionStatus;

  source: TransactionSource;
  provider: TransactionProvider;

  providerTransactionId: string | null;

  occurredAt: string | null;

  createdBy: string | null;
  approvedBy: string | null;

  approvedAt: string | null;
  appliedAt: string | null;
  rejectedAt: string | null;

  notes: string | null;
  errorMessage: string | null;

  metadata: Record<string, unknown>;

  createdAt: string;
  updatedAt: string;

  items: TransactionItemDTO[];
};

export type CreateTransactionItemInput = {
  leagueId: string;

  fromTeamId?: string | null;
  toTeamId?: string | null;

  playerId?: string | null;
  leaguePlayerId?: string | null;
  contractId?: string | null;
  draftPickId?: string | null;

  itemType: string;

  rosterAction?: TransactionRosterAction;
  contractAction?: TransactionContractAction;

  salaryBefore?: number | null;
  salaryAfter?: number | null;

  metadata?: Record<string, unknown>;
};

export type CreateTransactionInput = {
  leagueId: string;
  seasonId?: string | null;

  type: string;
  status?: TransactionStatus;

  source: TransactionSource;
  provider?: TransactionProvider;

  providerTransactionId?: string | null;

  occurredAt?: string | null;
  createdBy?: string | null;

  notes?: string | null;
  metadata?: Record<string, unknown>;

  items: CreateTransactionItemInput[];
};
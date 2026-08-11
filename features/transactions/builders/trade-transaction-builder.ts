import type {
  CreateTransactionInput,
  CreateTransactionItemInput,
} from "@/features/transactions/dto/transaction-dto";

export type TradePlayerAssetInput = {
  playerId: string;
  leaguePlayerId: string;
  contractId?: string | null;

  fromTeamId: string;
  toTeamId: string;

  playerName?: string | null;

  salaryBefore?: number | null;
  salaryAfter?: number | null;
};

export type TradeDraftPickAssetInput = {
  draftPickId: string;

  fromTeamId: string;
  toTeamId: string;

  seasonId: string;
  seasonYear: number;

  round: number;

  originalTeamId: string;
  originalTeamName?: string | null;
};

export type TradeTransactionBuilderInput = {
  leagueId: string;
  seasonId: string;

  createdBy: string;

  teamAId: string;
  teamBId: string;

  playersFromTeamA: TradePlayerAssetInput[];
  playersFromTeamB: TradePlayerAssetInput[];

  draftPicksFromTeamA: TradeDraftPickAssetInput[];
  draftPicksFromTeamB: TradeDraftPickAssetInput[];

  notes?: string | null;

  source?: "manual" | "system";
};

export type BuiltTransaction = {
  transaction: CreateTransactionInput;
  items: CreateTransactionItemInput[];
};
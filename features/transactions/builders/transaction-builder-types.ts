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

export type FreeAgentSigningTransactionBuilderInput = {
  leagueId: string;
  seasonId: string;

  createdBy?: string | null;

  teamId: string;

  playerId: string;
  leaguePlayerId: string;

  playerName?: string | null;

  contractYears: number;
  totalValue: number;
  guaranteedValue: number;
  signingBonus: number;
  yearOneSalary: number;

  salaryStructure: Array<{
    seasonId: string;
    seasonYear: number;
    salary: number;
    bonus: number;
  }>;

  freeAgencyOfferId: string;
  freeAgencyPeriodId: string;

  notes?: string | null;
};

export type PlayerReleaseTransactionBuilderInput = {
  leagueId: string;
  seasonId: string;

  createdBy: string;

  teamId: string;

  playerId: string;
  leaguePlayerId: string;
  contractId: string;

  playerName?: string | null;

  currentCapHit: number;

  deadCapSchedule: Array<{
    seasonId: string;
    seasonYear: number;
    amount: number;
  }>;

  totalDeadCap: number;
  totalCapSavings: number;

  notes?: string | null;
};

export type BuiltTransaction = {
  transaction: CreateTransactionInput;
  items: CreateTransactionItemInput[];
};
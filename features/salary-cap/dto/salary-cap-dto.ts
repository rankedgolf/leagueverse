export type CapHealthStatus =
  | "healthy"
  | "watch"
  | "over_cap";

export type TeamSeasonCapDTO = {
  seasonId: string;
  seasonName: string;
  seasonYear: number;
  committed: number;
  capSpace: number;
  usagePercentage: number;
};

export type TeamCapPlayerDTO = {
  contractId: string;
  leaguePlayerId: string;
  playerId: string;

  playerName: string;
  position: string | null;
  proTeam: string | null;

  currentCapHit: number;
  totalValue: number;

  endSeasonName: string;
  contractYears: number;

  futureCommitments: TeamSeasonCapDTO[];
};

export type LargestContractDTO = {
  contractId: string;
  playerName: string;
  position: string | null;
  proTeam: string | null;

  teamId: string;
  teamName: string;

  currentCapHit: number;
  totalValue: number;
  contractYears: number;
  endSeasonName: string;
};

export type TeamSalaryCapDTO = {
  teamId: string;
  teamName: string;

  salaryCap: number;
  currentCommitted: number;
  currentCapSpace: number;
  currentUsagePercentage: number;

  contractYearsUsed: number;
  maximumContractYears: number;

  playerCount: number;

  capHealth: CapHealthStatus;
  capHealthMessage: string;

  futureCommitments: TeamSeasonCapDTO[];
  players: TeamCapPlayerDTO[];
};

export type LeagueSalaryCapDTO = {
  salaryCap: number;

  currentSeasonId: string;
  currentSeasonName: string;

  teams: TeamSalaryCapDTO[];
  largestContracts: LargestContractDTO[];
};
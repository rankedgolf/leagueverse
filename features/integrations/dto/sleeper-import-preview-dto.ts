export type SleeperImportTeamDTO = {
  sleeperRosterId: string;
  sleeperOwnerId: string | null;

  teamName: string;
  ownerDisplayName: string | null;

  playerCount: number;
  yearOneSalary: number;
  contractYearsUsed: number;
};

export type SleeperImportPlayerDTO = {
  sleeperPlayerId: string;
  sleeperRosterId: string;

  playerName: string;
  firstName: string | null;
  lastName: string | null;

  position: string | null;
  proTeam: string | null;

  fantasyTeamName: string;
  ownerDisplayName: string | null;

  auctionSalary: number;
  contractYears: number;

  draftPickNumber: number | null;

  warnings: string[];
  errors: string[];
  isValid: boolean;
};

export type SleeperImportPreviewDTO = {
  externalLeagueId: string;
  externalDraftId: string | null;

  leagueName: string;
  season: string;
  sport: string;

  defaultContractYears: number;

  teamCount: number;
  playerCount: number;

  auctionPriceCount: number;
  auctionTotalSpent: number;

  validPlayerCount: number;
  invalidPlayerCount: number;
  warningPlayerCount: number;

  teams: SleeperImportTeamDTO[];
  players: SleeperImportPlayerDTO[];
};
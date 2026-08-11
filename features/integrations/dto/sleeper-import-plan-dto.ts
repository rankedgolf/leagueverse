export type SleeperImportPlanTeamDTO = {
  sleeperRosterId: string;
  teamName: string;

  existingTeamId: string | null;
  action: "create" | "reuse";
};

export type SleeperImportPlanPlayerDTO = {
  sleeperPlayerId: string;
  sleeperRosterId: string;

  playerName: string;
  fantasyTeamName: string;

  auctionSalary: number;
  contractYears: number;

  existingPlayerId: string | null;
  existingLeaguePlayerId: string | null;
  existingTeamId: string | null;
  existingContractId: string | null;

  playerAction: "create" | "reuse";
  leaguePlayerAction: "create" | "reuse";
  rosterAction: "assign" | "move" | "keep";
  contractAction: "create" | "skip_existing";

  warnings: string[];
};

export type SleeperImportPlanDTO = {
  leagueId: string;
  sessionId: string;

  teamCount: number;
  playerCount: number;

  teamsToCreate: number;
  teamsToReuse: number;

  playersToCreate: number;
  playersToReuse: number;

  leaguePlayersToCreate: number;
  leaguePlayersToReuse: number;

  rosterAssignmentsToCreate: number;
  rosterAssignmentsToMove: number;
  rosterAssignmentsAlreadyCorrect: number;

  contractsToCreate: number;
  contractsToSkip: number;

  warningCount: number;
  canImport: boolean;

  teams: SleeperImportPlanTeamDTO[];
  players: SleeperImportPlanPlayerDTO[];
};
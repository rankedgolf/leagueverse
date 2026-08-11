export type SleeperImportExecutionResultDTO = {
  success: boolean;
  leagueId: string;
  sessionId: string;

  teamsCreated: number;
  teamsReused: number;

  playersCreated: number;
  playersReused: number;

  leaguePlayersCreated: number;
  leaguePlayersReused: number;

  rosterAssignmentsCreated: number;
  rosterAssignmentsUpdated: number;

  contractsCreated: number;
  contractsSkipped: number;

  contractYearsCreated: number;

  warnings: string[];
  errors: string[];

  completedAt: string | null;
};
export type SleeperImportValidationIssue = {
  code: string;
  message: string;
  severity: "warning" | "error";
  sleeperRosterId?: string;
  sleeperPlayerId?: string;
};

export type SleeperImportTeamValidationDTO = {
  sleeperRosterId: string;
  teamName: string;
  playerCount: number;

  yearOneSalary: number;
  salaryCap: number;
  capSpace: number;
  isOverSalaryCap: boolean;

  contractYearsUsed: number;
  maximumContractYears: number;
  contractYearsAvailable: number;
  exceedsContractYears: boolean;

  errorCount: number;
  warningCount: number;
  isValid: boolean;
};

export type SleeperImportValidationDTO = {
  sessionId: string;
  leagueId: string;

  teamCount: number;
  playerCount: number;

  salaryCap: number;
  maximumContractLength: number;
  maximumContractYearsPerTeam: number;

  validTeamCount: number;
  invalidTeamCount: number;

  validPlayerCount: number;
  invalidPlayerCount: number;

  errorCount: number;
  warningCount: number;
  isValid: boolean;

  teams: SleeperImportTeamValidationDTO[];
  issues: SleeperImportValidationIssue[];
};
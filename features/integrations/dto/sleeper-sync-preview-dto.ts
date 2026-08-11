export type SleeperSyncPlayerChangeDTO = {
  sleeperPlayerId: string;
  playerId: string | null;
  playerName: string;

  changeType:
    | "add"
    | "drop"
    | "move"
    | "unmatched";

  fromTeamId: string | null;
  fromTeamName: string | null;

  toTeamId: string | null;
  toTeamName: string | null;

  sleeperRosterId: string | null;

  requiresCommissionerReview: boolean;
  message: string;
};

export type SleeperSyncTeamChangeDTO = {
  sleeperRosterId: string;
  teamId: string;

  currentLeagueVerseName: string;
  currentSleeperName: string;

  previousExternalOwnerId: string | null;
  currentExternalOwnerId: string | null;

  nameChanged: boolean;
  ownerChanged: boolean;
};

export type SleeperSyncPreviewDTO = {
  leagueId: string;
  integrationId: string;
  externalLeagueId: string;

  sleeperRosterCount: number;
  leagueVerseRosterCount: number;

  addedPlayerCount: number;
  droppedPlayerCount: number;
  movedPlayerCount: number;
  unmatchedPlayerCount: number;

  teamChangeCount: number;
  warningCount: number;

  hasChanges: boolean;
  canApplyAutomatically: boolean;

  playerChanges: SleeperSyncPlayerChangeDTO[];
  teamChanges: SleeperSyncTeamChangeDTO[];
  warnings: string[];

  generatedAt: string;
};
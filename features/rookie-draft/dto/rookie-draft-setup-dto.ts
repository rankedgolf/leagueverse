export type RookieDraftSetupPickDTO = {
  draftPickId: string;

  round: number;
  pickNumber: number | null;

  originalTeamId: string;
  currentTeamId: string;
};

export type RookieDraftSetupDTO = {
  leagueId: string;

  operationSeasonId: string;
  operationSeasonYear: number;

  draftSeasonId: string;
  draftSeasonYear: number;

  rookieDraftId: string | null;

  rounds: number;

  totalPicks: number;
  numberedPicks: number;
  unnumberedPicks: number;

  readyToOpen: boolean;

  picks: RookieDraftSetupPickDTO[];
};
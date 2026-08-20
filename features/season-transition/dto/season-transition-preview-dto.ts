export type SeasonTransitionPreviewDTO = {
  leagueId: string;

  currentSeasonId: string;
  currentSeasonName: string;
  currentSeasonYear: number;

  nextSeasonId: string;
  nextSeasonName: string;
  nextSeasonYear: number;

  followingSeasonYear: number;

  eligiblePlayerCount: number;
  existingRosterCount: number;
  playersToCarryForward: number;

  rosterComplianceComplete: boolean;

  freeAgencyClosed: boolean;
  rookieDraftClosed: boolean;

  readyToTransition: boolean;
};
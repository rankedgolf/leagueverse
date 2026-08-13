export type ReleasePreviewYearDTO = {
  seasonId: string;
  seasonName: string;
  seasonYear: number;

  currentCapHit: number;
  deadCap: number;
  capSavings: number;
};

export type ReleasePreviewDTO = {
  leagueId: string;
  teamId: string;

  contractId: string;
  leaguePlayerId: string;
  playerId: string;

  playerName: string;
  position: string | null;
  proTeam: string | null;

  currentSeasonId: string;
  currentSeasonName: string;

  years: ReleasePreviewYearDTO[];

  totalRemainingCapHit: number;
  totalDeadCap: number;
  totalCapSavings: number;
};
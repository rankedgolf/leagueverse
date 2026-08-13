export type FranchiseTagPreviewDTO = {
  leagueId: string;
  teamId: string;

  contractId: string;
  leaguePlayerId: string;
  playerId: string;

  playerName: string;
  position: string | null;
  proTeam: string | null;

  expiringSeasonId: string;
  expiringSeasonName: string;
  expiringSeasonYear: number;

  tagSeasonId: string;
  tagSeasonName: string;
  tagSeasonYear: number;

  previousCapHit: number;
  tagCapHit: number;
  tagPremium: number;

  tagAvailable: boolean;
  unavailableReason: string | null;
};
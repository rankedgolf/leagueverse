export type ContractExpirationPlayerDTO = {
  contractId: string;

  teamId: string;
  teamName: string;

  leaguePlayerId: string;
  playerId: string;

  playerName: string;
  position: string | null;
  proTeam: string | null;

  finalCapHit: number;

  outcome:
    | "franchise_tag"
    | "free_agent";

  tagSeasonId: string | null;
  tagSeasonName: string | null;
  tagCapHit: number | null;
};

export type ContractExpirationPreviewDTO = {
  leagueId: string;

  seasonId: string;
  seasonName: string;
  seasonYear: number;

  totalExpiring: number;
  totalTagged: number;
  totalEnteringFreeAgency: number;

  players: ContractExpirationPlayerDTO[];
};
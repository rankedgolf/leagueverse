export type ContractYearDTO = {
  id: string;
  seasonId: string;
  seasonName: string;
  salary: number;
  bonus: number;
  guaranteedAmount: number;
  capHit: number;
  isOptionYear: boolean;
  optionType: string | null;
};

export type ContractDTO = {
  id: string;
  leagueId: string;
  teamId: string;
  teamName: string;
  leaguePlayerId: string;
  playerId: string;
  playerName: string;
  position: string | null;
  proTeam: string | null;
  contractType: string;
  status: string;
  signedAt: string | null;
  startSeasonId: string;
  startSeasonName: string;
  endSeasonId: string;
  endSeasonName: string;
  totalValue: number;
  guaranteedValue: number;
  notes: string | null;
  years: ContractYearDTO[];
};
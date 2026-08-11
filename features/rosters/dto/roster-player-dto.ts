export type RosterContractYearDTO = {
  seasonId: string;
  seasonYear: number;
  salary: number;
  bonus: number;
  capHit: number;
  guaranteedAmount: number;
};

export type RosterContractDTO = {
  contractId: string;
  contractType: string;
  source: string;
  totalValue: number;
  guaranteedValue: number;
  startsSeasonId: string | null;
  endsSeasonId: string | null;
  currentCapHit: number | null;
  remainingYears: number;
  years: RosterContractYearDTO[];
};

export type RosterPlayerDTO = {
  rosterId: string;
  teamId: string;
  teamName: string;
  playerId: string;
  playerName: string;
  position: string | null;
  proTeam: string | null;
  rosterSlot: string;
  contract: RosterContractDTO | null;
};
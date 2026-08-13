export type LeagueOperationPhase =
  | "franchise_tag"
  | "contract_expiration"
  | "free_agency"
  | "rookie_draft"
  | "roster_compliance"
  | "season_transition";

export type LeagueOperationStatus =
  | "scheduled"
  | "open"
  | "paused"
  | "closed"
  | "completed"
  | "cancelled";

export type LeagueOperationPeriodDTO = {
  id: string;

  leagueId: string;
  seasonId: string;

  phase: LeagueOperationPhase;
  status: LeagueOperationStatus;

  opensAt: string | null;
  closesAt: string | null;

  openedAt: string | null;
  closedAt: string | null;

  processedAt: string | null;
};
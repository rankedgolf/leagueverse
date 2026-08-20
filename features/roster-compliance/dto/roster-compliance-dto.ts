export type TeamRosterComplianceDTO = {
  teamId: string;
  teamName: string;

  salaryCap: number;
  committed: number;
  capSpace: number;

  rosterCount: number;
  maximumRosterSize: number;

  overCap: boolean;
  overRoster: boolean;

  compliant: boolean;
};

export type RosterComplianceDTO = {
  leagueId: string;

  seasonId: string;
  seasonName: string;
  seasonYear: number;

  salaryCap: number;
  maximumRosterSize: number;

  totalTeams: number;
  compliantTeams: number;
  nonCompliantTeams: number;

  allCompliant: boolean;

  teams: TeamRosterComplianceDTO[];
};
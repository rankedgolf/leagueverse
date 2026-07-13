export type StandingDTO = {
  teamId: string;
  teamName: string;
  abbreviation: string | null;
  wins: number;
  losses: number;
  ties: number;
  pointsFor: number;
  pointsAgainst: number;
};
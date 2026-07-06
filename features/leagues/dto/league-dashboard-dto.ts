export type LeagueDashboardDTO = {
  league: {
    id: string;
    name: string;
    seasonName?: string | null;
  };

  membership: {
    role: string;
    isCommissioner: boolean;
  };

  stats: {
    teams: number;
    members: number;
  };

  checklist: {
    leagueCreated: boolean;
    hasTeams: boolean;
    hasMembers: boolean;
    importedLeague: boolean;
    salaryCapConfigured: boolean;
  };

  quickActions: {
    addTeam: string;
    inviteMembers: string;
    importLeague: string;
    settings: string;
  };
};
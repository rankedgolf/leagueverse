import { TeamRepository } from "../repositories/team-repository";

export const TeamService = {
  async getLeagueTeams(leagueId: string) {
    const teams = await TeamRepository.getByLeague(leagueId);

    return teams.map((team) => {
      const ownerMembership = Array.isArray(team.league_members)
        ? team.league_members[0]
        : team.league_members;

      const ownerProfile = Array.isArray(ownerMembership?.profiles)
        ? ownerMembership?.profiles[0]
        : ownerMembership?.profiles;

      return {
        id: team.id,
        leagueId: team.league_id,
        name: team.name,
        nickname: team.nickname,
        abbreviation: team.abbreviation,
        logo: team.logo_url,
        colors: {
          primary: team.primary_color,
          secondary: team.secondary_color,
        },
        owner: ownerMembership
          ? {
              id: ownerMembership.id,
              name:
                ownerProfile?.display_name ||
                ownerProfile?.email ||
                "Unnamed Owner",
            }
          : null,
        createdAt: team.created_at,
      };
    });
  },
};
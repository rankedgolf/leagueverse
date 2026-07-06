import { TeamRepository } from "../repositories/team-repository";

export const TeamService = {
  async getLeagueTeams(leagueId: string) {
    const teams = await TeamRepository.getByLeague(leagueId);

    return teams.map((team) => ({
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
      createdAt: team.created_at,
    }));
  },
};
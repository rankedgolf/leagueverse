import type { StandingDTO } from "@/features/standings/dto/standing-dto";
import { StandingRepository } from "@/features/standings/repositories/standing-repository";
import { TeamRepository } from "@/features/teams/repositories/team-repository";

type TeamRow = Awaited<ReturnType<typeof TeamRepository.getByLeague>>[number];

type StandingRow = Awaited<
  ReturnType<typeof StandingRepository.getByLeagueAndSeason>
>[number];

export const StandingService = {
  async getLeagueStandings(
    leagueId: string,
    seasonId: string
  ): Promise<StandingDTO[]> {
    const [teams, standings] = await Promise.all([
      TeamRepository.getByLeague(leagueId),
      StandingRepository.getByLeagueAndSeason(leagueId, seasonId),
    ]);

    return teams.map((team: TeamRow) => {
      const standing = standings.find(
        (row: StandingRow) => row.team_id === team.id
      );

      return {
        teamId: team.id,
        teamName: team.name,
        abbreviation: team.abbreviation,
        wins: standing?.wins ?? 0,
        losses: standing?.losses ?? 0,
        ties: standing?.ties ?? 0,
        pointsFor: Number(standing?.points_for ?? 0),
        pointsAgainst: Number(standing?.points_against ?? 0),
      };
    });
  },
};
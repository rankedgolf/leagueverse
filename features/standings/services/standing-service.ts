import type { StandingDTO } from "@/features/standings/dto/standing-dto";
import { StandingRepository } from "@/features/standings/repositories/standing-repository";
import { TeamRepository } from "@/features/teams/repositories/team-repository";
import type { ServerSupabaseClient } from "@/lib/supabase/types";

export const StandingService = {
 async getLeagueStandings(
  leagueId: string,
  seasonId: string,
  client?: ServerSupabaseClient,
): Promise<StandingDTO[]> {
   const [teams, standings] = await Promise.all([
  TeamRepository.getByLeague(
    leagueId,
    client,
  ),

  StandingRepository.getByLeagueAndSeason(
    leagueId,
    seasonId,
    client,
  ),
]);

    return teams.map((team) => {
      const standing = standings.find(
        (row) => row.team_id === team.id
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
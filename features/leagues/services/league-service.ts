import { LeagueRepository } from "../repositories/league-repository";
import { TeamService } from "@/features/teams/services/team-service";
import type { LeagueDashboardDTO } from "../dto/league-dashboard-dto";

export const LeagueService = {
  async getDashboard(
    leagueId: string,
    userId: string
  ): Promise<LeagueDashboardDTO | null> {
    const membership = await LeagueRepository.getMembership(leagueId, userId);

    if (!membership) {
      return null;
    }

    const league = await LeagueRepository.getById(leagueId);

    if (!league) {
      return null;
    }

    const season = league.current_season_id
      ? await LeagueRepository.getSeasonById(league.current_season_id)
      : null;

    const teams = await TeamService.getLeagueTeams(leagueId);
    const ownersAssigned = teams.filter((team) => team.owner).length;
    const memberCount = await LeagueRepository.getMemberCount(leagueId);
    const hasSalaryCapSettings =
      await LeagueRepository.hasSalaryCapSettings(
        leagueId,
        league.current_season_id
      );

    const isCommissioner = ["owner", "commissioner", "co_commissioner"].includes(
      membership.role
    );

    return {
      league: {
        id: league.id,
        name: league.name,
        seasonName: season?.name || null,
      },

      membership: {
        role: membership.role,
        isCommissioner,
      },

      stats: {
        teams: teams.length,
        members: memberCount,
        ownersAssigned,
      },

      checklist: {
        leagueCreated: true,
        hasTeams: teams.length > 0,
        hasMembers: memberCount > 1,
        importedLeague: Boolean(league.provider_primary),
        salaryCapConfigured: hasSalaryCapSettings,
      },

      quickActions: {
        addTeam: `/leagues/${leagueId}/teams/new`,
        inviteMembers: `/leagues/${leagueId}/members`,
        importLeague: `/leagues/${leagueId}/import`,
        settings: `/leagues/${leagueId}/settings`,
      },
    };
  },
};
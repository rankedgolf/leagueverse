import type { RosterPlayerDTO } from "@/features/rosters/dto/roster-player-dto";
import { RosterRepository } from "@/features/rosters/repositories/roster-repository";

export const RosterService = {
  async getLeagueRosterPlayers(
    leagueId: string,
    seasonId: string
  ): Promise<RosterPlayerDTO[]> {
    const rows = await RosterRepository.getByLeagueAndSeason(
      leagueId,
      seasonId
    );

    return rows.map((row) => {
      const team = Array.isArray(row.teams) ? row.teams[0] : row.teams;
      const player = Array.isArray(row.players) ? row.players[0] : row.players;

      return {
        rosterId: row.id,
        teamId: row.team_id,
        teamName: team?.name ?? "Unknown Team",
        playerId: row.player_id,
       playerName:
  [player?.first_name, player?.last_name].filter(Boolean).join(" ") ||
  "Unknown Player",
        position: player?.position ?? null,
       proTeam: player?.pro_team ?? null,
        rosterSlot: row.roster_slot,
      };
    });
  },
};
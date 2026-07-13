import type { PlayerDTO } from "@/features/players/dto/player-dto";
import { PlayerRepository } from "@/features/players/repositories/player-repository";

export const PlayerService = {
  async getPlayers(): Promise<PlayerDTO[]> {
    const players = await PlayerRepository.getAll();

    return players.map((player) => ({
      id: player.id,
      displayName: player.display_name ?? player.full_name ?? "Unknown Player",
      firstName: player.first_name,
      lastName: player.last_name,
      position: player.position,
      proTeam: player.pro_team,
      sport: player.sport,
      status: player.status,
    }));
  },
};
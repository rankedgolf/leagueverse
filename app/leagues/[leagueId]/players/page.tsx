import { PlayerService } from "@/features/players/services/player-service";

export default async function PlayersPage() {
  const players = await PlayerService.getPlayers();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Players</h1>
        <p className="text-sm text-gray-400">
          Manage the LeagueVerse player database.
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Player</th>
              <th className="px-4 py-3 text-center">Pos</th>
              <th className="px-4 py-3 text-center">Pro Team</th>
              <th className="px-4 py-3 text-center">Sport</th>
              <th className="px-4 py-3 text-right">Status</th>
            </tr>
          </thead>

          <tbody>
            {players.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                  No players have been added yet.
                </td>
              </tr>
            ) : (
              players.map((player) => (
                <tr key={player.id} className="border-t border-gray-800">
                  <td className="px-4 py-3 font-medium text-white">
                    {player.displayName}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">
                    {player.position ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">
                    {player.proTeam ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">
                    {player.sport ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {player.status ?? "active"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
import { RosterService } from "@/features/rosters/services/roster-service";
import { SeasonService } from "@/features/seasons/services/season-service";
import { TeamRepository } from "@/features/teams/repositories/team-repository";
import { PlayerService } from "@/features/players/services/player-service";
import { AssignExistingPlayerForm } from "@/features/rosters/components/assign-existing-player-form";
import { RemoveRosterPlayerButton } from "@/features/rosters/components/remove-roster-player-button";

type RostersPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function RostersPage({ params }: RostersPageProps) {
  const { leagueId } = await params;

  const activeSeason = await SeasonService.getActiveSeasonByLeague(leagueId);

  if (!activeSeason) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Rosters</h1>
        <p className="text-sm text-gray-400">
          No active season has been created for this league yet.
        </p>
      </div>
    );
  }

  const teams = await TeamRepository.getByLeague(leagueId);
  const players = await PlayerService.getPlayers();

  const rosterPlayers = await RosterService.getLeagueRosterPlayers(
    leagueId,
    activeSeason.id
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Rosters</h1>
        <p className="text-sm text-gray-400">{activeSeason.name}</p>
      </div>

 <AssignExistingPlayerForm
  leagueId={leagueId}
  seasonId={activeSeason.id}
  teams={teams.map((team) => ({
    id: team.id,
    name: team.name,
  }))}
  players={players.map((player) => ({
    id: player.id,
    displayName: player.displayName,
    position: player.position,
    proTeam: player.proTeam,
  }))}
/>

      <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Player</th>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-center">Pos</th>
              <th className="px-4 py-3 text-center">Pro Team</th>
              <th className="px-4 py-3 text-right">Slot</th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>

          <tbody>
            {rosterPlayers.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-gray-400"
                >
                  No players have been added to rosters yet.
                </td>
              </tr>
            ) : (
              rosterPlayers.map((player) => (
                <tr key={player.rosterId} className="border-t border-gray-800">
                  <td className="px-4 py-3 font-medium text-white">
                    {player.playerName}
                  </td>
                  <td className="px-4 py-3 text-gray-300">
                    {player.teamName}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">
                    {player.position ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-center text-gray-300">
                    {player.proTeam ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-300">
                    {player.rosterSlot}
                  </td>

                  <td className="px-4 py-3 text-right">
  <RemoveRosterPlayerButton
    leagueId={leagueId}
    rosterId={player.rosterId}
    playerName={player.playerName}
  />
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
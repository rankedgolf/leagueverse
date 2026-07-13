import { StandingService } from "@/features/standings/services/standing-service";
import { SeasonService } from "@/features/seasons/services/season-service";

type StandingsPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function StandingsPage({ params }: StandingsPageProps) {
  const { leagueId } = await params;

  const activeSeason = await SeasonService.getActiveSeasonByLeague(leagueId);

  if (!activeSeason) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Standings</h1>
        <p className="text-sm text-gray-400">
          No active season has been created for this league yet.
        </p>
      </div>
    );
  }

  const standings = await StandingService.getLeagueStandings(
    leagueId,
    activeSeason.id
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Standings</h1>
        <p className="text-sm text-gray-400">
          {activeSeason.name}
        </p>
      </div>

      <div className="overflow-hidden rounded-lg border border-gray-800 bg-gray-950">
        <table className="w-full text-sm">
          <thead className="bg-gray-900 text-gray-400">
            <tr>
              <th className="px-4 py-3 text-left">Team</th>
              <th className="px-4 py-3 text-center">W</th>
              <th className="px-4 py-3 text-center">L</th>
              <th className="px-4 py-3 text-center">T</th>
              <th className="px-4 py-3 text-right">PF</th>
              <th className="px-4 py-3 text-right">PA</th>
            </tr>
          </thead>
          <tbody>
            {standings.map((team) => (
              <tr key={team.teamId} className="border-t border-gray-800">
                <td className="px-4 py-3 font-medium text-white">
                  {team.teamName}
                  {team.abbreviation ? (
                    <span className="ml-2 text-xs text-gray-500">
                      {team.abbreviation}
                    </span>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-center text-gray-300">
                  {team.wins}
                </td>
                <td className="px-4 py-3 text-center text-gray-300">
                  {team.losses}
                </td>
                <td className="px-4 py-3 text-center text-gray-300">
                  {team.ties}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {team.pointsFor}
                </td>
                <td className="px-4 py-3 text-right text-gray-300">
                  {team.pointsAgainst}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
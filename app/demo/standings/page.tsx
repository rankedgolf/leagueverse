import { DemoLeagueService } from "@/features/demo/services/demo-league-service";
import { TeamService } from "@/features/teams/services/team-service";

export default async function DemoStandingsPage() {
  const leagueId = DemoLeagueService.getLeagueId();

  const teams =
    await TeamService.getLeagueTeams(
      leagueId,
    );

  const sortedTeams =
    [...teams].sort((a, b) =>
      a.name.localeCompare(
        b.name,
      ),
    );

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">
          Standings
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          League Standings
        </h1>

        <p className="mt-3 text-slate-400">
          Demo standings showcasing
          franchise organization and
          long-term team building.
        </p>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-slate-800">
        <table className="w-full text-sm">
          <thead className="bg-slate-900 text-slate-400">
            <tr>
              <th className="px-4 py-4 text-left">
                Rank
              </th>

              <th className="px-4 py-4 text-left">
                Team
              </th>

              <th className="px-4 py-4 text-left">
                Owner
              </th>

            </tr>
          </thead>

          <tbody>
            {sortedTeams.map(
              (
                team,
                index,
              ) => (
                <tr
                  key={team.id}
                  className="border-t border-slate-800"
                >
                  <td className="px-4 py-4 font-bold text-white">
                    {index + 1}
                  </td>

                  <td className="px-4 py-4">
                    <div>
                      <p className="font-semibold text-white">
                        {team.name}
                      </p>

                      <p className="text-xs text-slate-500">
                        {team.abbreviation}
                      </p>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-slate-300">
                    {team.owner
                      ?.name ??
                      "Commissioner"}
                  </td>

                </tr>
              ),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
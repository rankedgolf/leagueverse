import { DemoLeagueService } from "@/features/demo/services/demo-league-service";
import { TeamService } from "@/features/teams/services/team-service";

export default async function DemoTeamsPage() {
  const leagueId =
    DemoLeagueService.getLeagueId();

  const teams =
    await TeamService.getLeagueTeams(
      leagueId,
    );

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">
          Teams
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          League Franchises
        </h1>

        <p className="mt-3 max-w-2xl text-slate-400">
          Explore each franchise in the LeagueVerse Demo League,
          including roster construction, contracts, and long-term
          team strategy.
        </p>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.length > 0 ? (
          teams.map((team) => (
            <div
              key={team.id}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
            >
              <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
                {team.abbreviation || "TEAM"}
              </p>

              <h2 className="mt-2 text-2xl font-bold text-white">
                {team.name}
              </h2>

              <p className="mt-2 text-slate-400">
                {team.nickname ||
                  "LeagueVerse Franchise"}
              </p>

              <div className="mt-5 border-t border-slate-800 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Owner
                </p>

                <p className="mt-1 font-semibold text-white">
                  {team.owner?.name ||
                    "Unassigned"}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">
              No teams available
            </h2>

            <p className="mt-2 text-slate-400">
              The demo league has not been populated yet.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
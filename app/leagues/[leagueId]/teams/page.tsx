import Link from "next/link";
import { TeamService } from "@/features/teams/services/team-service";

type TeamsPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function TeamsPage({ params }: TeamsPageProps) {
  const { leagueId } = await params;

  const teams = await TeamService.getLeagueTeams(leagueId);

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">Teams</p>
          <h1 className="mt-2 text-4xl font-bold">League Franchises</h1>
          <p className="mt-3 text-slate-400">
            Manage every franchise in this LeagueVerse.
          </p>
        </div>

        <Link
          href={`/leagues/${leagueId}/teams/new`}
          className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-950"
        >
          Add Team
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams && teams.length > 0 ? (
          teams.map((team) => (
            <Link
              key={team.id}
              href={`/leagues/${leagueId}/teams/${team.id}`}
              className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-600"
            >
              <p className="text-sm text-slate-400">
                {team.abbreviation || "TEAM"}
              </p>
              <h2 className="mt-2 text-2xl font-bold">{team.name}</h2>
              <p className="mt-2 text-slate-400">
                {team.nickname || "No nickname set"}
              </p>
            </Link>
          ))
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-xl font-bold">No teams yet</h2>
            <p className="mt-2 text-slate-400">
              Add teams manually or import from a fantasy platform.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
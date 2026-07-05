import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLeagueDashboard } from "@/features/leagues/lib/get-league-dashboard";

type LeaguePageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function LeaguePage({ params }: LeaguePageProps) {
  const { leagueId } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const dashboard = await getLeagueDashboard(leagueId, user.id);

  if (!dashboard) {
    notFound();
  }

  const isCommissioner = ["owner", "commissioner", "co_commissioner"].includes(
    dashboard.membership.role
  );

  return (
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">
              LeagueVerse
            </p>
            <h1 className="mt-2 text-4xl font-bold">{dashboard.league.name}</h1>
            <p className="mt-2 text-slate-400">
              {dashboard.currentSeason?.name || "No active season"} · Your role:{" "}
              {dashboard.membership.role}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            {isCommissioner && (
              <>
                <Link
                  href={`/leagues/${leagueId}/import`}
                  className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-950"
                >
                  Import League
                </Link>

                <Link
                  href={`/leagues/${leagueId}/settings`}
                  className="rounded-lg border border-slate-700 px-4 py-3 font-semibold text-white"
                >
                  Settings
                </Link>
              </>
            )}
          </div>
        </div>

        <section className="mt-8 grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Teams</p>
            <p className="mt-2 text-3xl font-bold">{dashboard.teams.length}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Members</p>
            <p className="mt-2 text-3xl font-bold">{dashboard.memberCount}</p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Salary Cap</p>
            <p className="mt-2 text-3xl font-bold">
              {dashboard.salaryCap
                ? `$${Number(dashboard.salaryCap.cap_amount).toLocaleString()}`
                : "Not set"}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm text-slate-400">Season</p>
            <p className="mt-2 text-3xl font-bold">
              {dashboard.currentSeason?.year || "—"}
            </p>
          </div>
        </section>

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Teams</h2>
              {isCommissioner && (
                <Link
                  href={`/leagues/${leagueId}/teams/new`}
                  className="text-sm font-semibold text-white underline"
                >
                  Add Team
                </Link>
              )}
            </div>

            <div className="mt-6 space-y-3">
              {dashboard.teams.length === 0 ? (
                <p className="text-slate-400">
                  No teams yet. Import a league or add teams manually.
                </p>
              ) : (
                dashboard.teams.map((team) => (
                  <div
                    key={team.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <p className="font-semibold">{team.name}</p>
                    <p className="text-sm text-slate-400">
                      {team.abbreviation || "No abbreviation"}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="text-2xl font-bold">Recent Activity</h2>

            <div className="mt-6 space-y-3">
              {dashboard.recentTransactions.length === 0 ? (
                <p className="text-slate-400">
                  No transactions yet. League activity will appear here.
                </p>
              ) : (
                dashboard.recentTransactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="rounded-xl border border-slate-800 bg-slate-950 p-4"
                  >
                    <p className="font-semibold">{transaction.type}</p>
                    <p className="text-sm text-slate-400">
                      {transaction.status}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>
  );
}
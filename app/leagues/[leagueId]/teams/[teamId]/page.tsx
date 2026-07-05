import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type TeamPageProps = {
  params: Promise<{
    leagueId: string;
    teamId: string;
  }>;
};

export default async function TeamPage({ params }: TeamPageProps) {
  const { leagueId, teamId } = await params;

  const supabase = await createClient();

  const { data: team } = await supabase
    .from("teams")
    .select("id,name,nickname,abbreviation,logo_url,primary_color,secondary_color,founded_year")
    .eq("id", teamId)
    .eq("league_id", leagueId)
    .single();

  if (!team) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-wide text-slate-400">
            Franchise HQ
          </p>
          <h1 className="mt-2 text-4xl font-bold">{team.name}</h1>
          <p className="mt-3 text-slate-400">
            {team.nickname || "No nickname"} · {team.abbreviation || "No abbreviation"}
          </p>
        </div>

        <Link
          href={`/leagues/${leagueId}/teams/${team.id}/edit`}
          className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-950"
        >
          Edit Team
        </Link>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Owner</p>
          <p className="mt-2 text-2xl font-bold">Unassigned</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Roster</p>
          <p className="mt-2 text-2xl font-bold">0 Players</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Salary Cap</p>
          <p className="mt-2 text-2xl font-bold">Not Set</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Founded</p>
          <p className="mt-2 text-2xl font-bold">
            {team.founded_year || "—"}
          </p>
        </div>
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 lg:col-span-2">
          <h2 className="text-2xl font-bold">Franchise Story</h2>
          <p className="mt-3 text-slate-400">
            This team profile will eventually include roster history, contracts,
            draft picks, transactions, rivalries, championships, and AI-generated
            franchise storylines.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">Quick Links</h2>
          <div className="mt-4 space-y-3 text-slate-300">
            <p>Roster</p>
            <p>Contracts</p>
            <p>Transactions</p>
            <p>Team History</p>
          </div>
        </div>
      </section>
    </div>
  );
}
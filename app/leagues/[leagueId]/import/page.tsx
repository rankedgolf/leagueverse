import Link from "next/link";

import { LeagueImportForm } from "@/features/imports/components/league-import-form";

type LeagueImportPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function LeagueImportPage({
  params,
}: LeagueImportPageProps) {
  const { leagueId } = await params;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
          League Migration
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Import League
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Bring your existing dynasty league into LeagueVerse.
          Sleeper leagues can use the automated integration, while ESPN,
          Yahoo, MFL, Fleaflicker, and other leagues can use the
          LeagueVerse manual import template.
        </p>
      </div>

      <section className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-800 bg-emerald-950/20 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
            Recommended for Sleeper
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Automatic Sleeper Import
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Connect your existing Sleeper league and import your league
            structure using the LeagueVerse Sleeper integration.
          </p>

          <div className="mt-5 space-y-2 text-sm text-slate-300">
            <p>✓ Existing teams</p>
            <p>✓ Existing roster assignments</p>
            <p>✓ Sleeper league data</p>
            <p>✓ Faster setup</p>
          </div>

          <Link
            href={`/leagues/${leagueId}/integrations/sleeper/import`}
            className="mt-6 inline-flex rounded-lg bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-500"
          >
            Import from Sleeper
          </Link>
        </div>

        <div className="rounded-2xl border border-violet-800 bg-violet-950/20 p-6">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
            ESPN, Yahoo & More
          </p>

          <h2 className="mt-3 text-2xl font-bold text-white">
            Manual Spreadsheet Import
          </h2>

          <p className="mt-3 text-sm leading-6 text-slate-400">
            Download the LeagueVerse import template, enter your league
            information, and upload the completed workbook.
          </p>

          <div className="mt-5 space-y-2 text-sm text-slate-300">
            <p>✓ ESPN leagues</p>
            <p>✓ Yahoo leagues</p>
            <p>✓ MFL and Fleaflicker</p>
            <p>✓ Custom dynasty leagues</p>
          </div>

          <Link
            href={`/leagues/${leagueId}/import/manual`}
            className="mt-6 inline-flex rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-600"
          >
            Manual Import
          </Link>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold text-white">
          Existing LeagueVerse Import
        </h2>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          You can also import players, roster assignments, first-year
          salaries, and contract lengths using the existing LeagueVerse
          import workflow below.
        </p>

        <div className="mt-6">
          <LeagueImportForm
            leagueId={leagueId}
          />
        </div>
      </section>
    </div>
  );
}
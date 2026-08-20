import Link from "next/link";

import { ManualImportUpload } from "@/features/manual-import/components/manual-import-upload";

type ManualImportPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function ManualImportPage({
  params,
}: ManualImportPageProps) {
  const { leagueId } =
    await params;

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
          Manual League Import
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          Import ESPN, Yahoo, or Another League
        </h1>

        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-400">
          Use the LeagueVerse import workbook to migrate your teams,
          rosters, contracts, and future draft picks into this league.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Step 1
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Download the LeagueVerse Template
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          Complete the required Teams and Rosters tabs. Contracts and
          Draft Picks are optional and can be imported if your league
          already tracks them.
        </p>

        <Link
          href="/imports/LeagueVerse_Manual_Import_Template.xlsx"
          className="mt-5 inline-flex rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-600"
        >
          Download Import Template
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Step 2
        </p>

        <h2 className="mt-2 text-2xl font-bold text-white">
          Upload & Preview Workbook
        </h2>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
          LeagueVerse will validate the workbook and show you what it
          found before anything is written to your league.
        </p>

        <div className="mt-6">
          <ManualImportUpload
            leagueId={
              leagueId
            }
          />
        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-950 p-5">
        <p className="text-sm font-semibold text-white">
          Manual Import Note
        </p>

        <p className="mt-2 text-sm leading-6 text-slate-400">
          ESPN, Yahoo, and other spreadsheet imports migrate league
          data into LeagueVerse but do not automatically synchronize
          weekly activity with the original fantasy platform.
        </p>
      </section>

      <div>
        <Link
          href={`/leagues/${leagueId}/import`}
          className="text-sm font-semibold text-slate-400 hover:text-white"
        >
          ← Back to Import Options
        </Link>
      </div>
    </div>
  );
}
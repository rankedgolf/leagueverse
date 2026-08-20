import Link from "next/link";

export default function ManualImportPage() {
  return (
    <main className="mx-auto max-w-4xl px-6 py-16">
      <div>
        <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
          Manual League Import
        </p>

        <h1 className="mt-4 text-4xl font-bold">
          Import ESPN, Yahoo, and other dynasty leagues
        </h1>

        <p className="mt-4 text-slate-400">
          Use the LeagueVerse import template to migrate your league.
          Sleeper commissioners should continue using the automatic
          Sleeper integration.
        </p>
      </div>

      <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h2 className="text-2xl font-bold">
          Step 1: Download the template
        </h2>

        <Link
          href="/imports/LeagueVerse_Manual_Import_Template.xlsx"
          className="mt-6 inline-block rounded-lg bg-violet-600 px-6 py-3 font-semibold text-white"
        >
          Download Template
        </Link>
      </div>

      <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h2 className="text-2xl font-bold">
          Step 2: Upload your completed workbook
        </h2>

        <p className="mt-4 text-slate-400">
          Coming in the next update.
        </p>
      </div>
    </main>
  );
}
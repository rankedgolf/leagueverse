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
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Import League
        </h1>

        <p className="mt-1 max-w-3xl text-sm text-slate-400">
          Import players, roster assignments, first-year salaries,
          and contract lengths in one workflow.
        </p>
      </div>

      <LeagueImportForm leagueId={leagueId} />
    </div>
  );
}
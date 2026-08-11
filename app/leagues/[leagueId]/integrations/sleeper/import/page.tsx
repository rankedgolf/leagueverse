import { SleeperImportWizard } from "@/features/integrations/components/sleeper-import/sleeper-import-wizard";
import { IntegrationService } from "@/features/integrations/services/integration-service";

type SleeperImportPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function SleeperImportPage({
  params,
}: SleeperImportPageProps) {
  const { leagueId } = await params;

  const sleeperIntegration =
    await IntegrationService.getLeagueIntegration(
      leagueId,
      "sleeper",
    );

  if (
    !sleeperIntegration ||
    !sleeperIntegration.isConnected
  ) {
    return (
      <div className="rounded-xl border border-amber-900/60 bg-amber-950/30 p-5">
        <h1 className="text-xl font-semibold text-amber-300">
          Sleeper is not connected
        </h1>

        <p className="mt-2 text-sm text-slate-300">
          Connect this league to Sleeper before starting an
          import.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-400">
          Sleeper Import
        </p>

        <h1 className="mt-1 text-2xl font-bold text-white">
          Import League
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Review the connected Sleeper league, assign contract
          years, validate team limits, and import the complete
          league into LeagueVerse.
        </p>
      </div>

      <SleeperImportWizard leagueId={leagueId} />
    </div>
  );
}
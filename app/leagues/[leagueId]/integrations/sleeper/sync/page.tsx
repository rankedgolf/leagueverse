import { SleeperSyncPreview } from "@/features/integrations/components/sleeper-sync/sleeper-sync-preview";
import { IntegrationService } from "@/features/integrations/services/integration-service";

type SleeperSyncPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function SleeperSyncPage({
  params,
}: SleeperSyncPageProps) {
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
          Connect this league to Sleeper before previewing roster
          changes.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-emerald-400">
          Sleeper Integration
        </p>

        <h1 className="mt-1 text-2xl font-bold text-white">
          Roster Sync
        </h1>

        <p className="mt-2 max-w-3xl text-sm text-slate-400">
          Compare the current Sleeper rosters with LeagueVerse.
          Nothing will be changed until the commissioner reviews and
          approves the detected differences.
        </p>
      </div>

      <SleeperSyncPreview leagueId={leagueId} />
    </div>
  );
}
import { SleeperIntegrationCard } from "@/features/integrations/components/sleeper-integration-card";
import { IntegrationService } from "@/features/integrations/services/integration-service";

type IntegrationsPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function IntegrationsPage({
  params,
}: IntegrationsPageProps) {
  const { leagueId } = await params;

  const sleeperIntegration =
    await IntegrationService.getLeagueIntegration(
      leagueId,
      "sleeper",
    );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Integrations
        </h1>

        <p className="mt-1 max-w-3xl text-sm text-slate-400">
          Connect LeagueVerse to your fantasy platform to import teams,
          rosters, draft results, auction salaries, and future roster
          changes.
        </p>
      </div>

      <SleeperIntegrationCard
        leagueId={leagueId}
        existingIntegration={sleeperIntegration}
      />

      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 opacity-70">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                Yahoo Fantasy
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                OAuth connection and league import.
              </p>
            </div>

            <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-medium text-slate-400">
              Coming Soon
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-slate-900 p-5 opacity-70">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-white">
                ESPN Fantasy
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                League and roster import options are being evaluated.
              </p>
            </div>

            <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-xs font-medium text-slate-400">
              Coming Soon
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}

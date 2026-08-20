import { RookieDraftSetupService } from "@/features/rookie-draft/services/rookie-draft-setup-service";
import { TeamRepository } from "@/features/teams/repositories/team-repository";
import { RookieDraftOrderManager } from "@/features/rookie-draft/components/rookie-draft-order-manager";

import { RookieDraftOperationControls } from "@/features/league-operations/components/rookie-draft-operation-controls";
import { LeagueOperationService } from "@/features/league-operations/services/league-operation-service";
import { RookieDraftImportForm } from "@/features/rookie-draft/components/rookie-draft-import-form";
import { CompleteRookieDraftButton } from "@/features/rookie-draft/components/complete-rookie-draft-button";

type RookieDraftOperationPreviewProps = {
  leagueId: string;
};

export async function RookieDraftOperationPreview({
  leagueId,
}: RookieDraftOperationPreviewProps) {
const [
  setup,
  teams,
] = await Promise.all([
  RookieDraftSetupService.getSetup({
    leagueId,
  }),

  TeamRepository.getByLeague(
    leagueId,
  ),
]);

const rookieDraftPeriod =
  await LeagueOperationService.getPhase({
    leagueId,
    seasonId: setup.operationSeasonId,
    phase: "rookie_draft",
  });

  return (
    <div className="mt-5 border-t border-slate-800 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Rookie Draft Setup
      </p>

      <h3 className="mt-2 text-lg font-semibold text-white">
        {setup.draftSeasonYear} Rookie Draft
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <InfoCard
          label="Rounds"
          value={String(
            setup.rounds,
          )}
        />

        <InfoCard
          label="Total Picks"
          value={String(
            setup.totalPicks,
          )}
        />

        <InfoCard
          label="Numbered Picks"
          value={String(
            setup.numberedPicks,
          )}
        />

        {setup.readyToOpen ? (
  <InfoCard
    label="Draft Status"
    value="Ready"
  />
) : (
  <InfoCard
    label="Unnumbered"
    value={String(
      setup.unnumberedPicks,
    )}
  />
)}
      </div>

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Draft Readiness
        </p>

        <p
          className={`mt-1 text-sm font-semibold ${
            setup.readyToOpen
              ? "text-emerald-300"
              : "text-amber-300"
          }`}
        >
          {setup.readyToOpen
            ? "✓ Draft Order Complete"
            : `${setup.unnumberedPicks} pick${
                setup.unnumberedPicks === 1
                  ? ""
                  : "s"
              } still need draft positions`}
        </p>
      </div>

 <RookieDraftOrderManager
  leagueId={leagueId}
  draftSeasonId={
    setup.draftSeasonId
  }
  teams={teams.map((team) => ({
    id: team.id,
    name: team.name,
  }))}
/>

<RookieDraftOperationControls
  leagueId={leagueId}
  operationSeasonId={
    setup.operationSeasonId
  }
  draftSeasonId={
    setup.draftSeasonId
  }
  rounds={setup.rounds}
  readyToOpen={
    setup.readyToOpen
  }
  period={
    rookieDraftPeriod
      ? {
          status:
            rookieDraftPeriod.status,

          opensAt:
            rookieDraftPeriod.opens_at,

          closesAt:
            rookieDraftPeriod.closes_at,
        }
      : null
  }
/>

<RookieDraftImportForm
  leagueId={leagueId}
/>

{rookieDraftPeriod?.status !==
  "completed" &&
setup.readyToOpen ? (
  <div className="mt-4">
    <CompleteRookieDraftButton
      leagueId={leagueId}
      operationSeasonId={
        setup.operationSeasonId
      }
      draftSeasonId={
        setup.draftSeasonId
      }
    />
  </div>
) : null}
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-800 bg-slate-950 p-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-lg font-semibold text-white">
        {value}
      </p>
    </div>
  );
}
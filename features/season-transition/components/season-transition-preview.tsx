import { SeasonTransitionPreviewService } from "@/features/season-transition/services/season-transition-preview-service";
import { ProcessSeasonTransitionButton } from "@/features/season-transition/components/process-season-transition-button";

type SeasonTransitionPreviewProps = {
  leagueId: string;
};

export async function SeasonTransitionPreview({
  leagueId,
}: SeasonTransitionPreviewProps) {
  const preview =
    await SeasonTransitionPreviewService.getPreview({
      leagueId,
    });

  return (
    <div className="mt-5 border-t border-slate-800 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Season Transition
      </p>

      <h3 className="mt-2 text-lg font-semibold text-white">
        {preview.currentSeasonYear}
        {" → "}
        {preview.nextSeasonYear}
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <InfoCard
          label="Eligible Players"
          value={String(
            preview.eligiblePlayerCount,
          )}
        />

        <InfoCard
          label="Already on New Roster"
          value={String(
            preview.existingRosterCount,
          )}
        />

        <InfoCard
          label="Carry Forward"
          value={String(
            preview.playersToCarryForward,
          )}
        />
      </div>

      <div className="mt-4 space-y-2">
        <Requirement
          label="Roster Compliance"
          complete={
            preview.rosterComplianceComplete
          }
        />

        <Requirement
          label="Free Agency Closed"
          complete={
            preview.freeAgencyClosed
          }
        />

        <Requirement
          label="Rookie Draft Closed"
          complete={
            preview.rookieDraftClosed
          }
        />
      </div>

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          Transition Actions
        </p>

        <div className="mt-2 space-y-1 text-sm text-slate-300">
          <p>
            {preview.currentSeasonName} will be archived.
          </p>

          <p>
            {preview.nextSeasonName} will become the active season.
          </p>

          <p>
            Missing {preview.nextSeasonYear} roster rows will be created from active contracts.
          </p>

          <p>
            {preview.followingSeasonYear} will be provisioned if needed.
          </p>
        </div>
      </div>

  <ProcessSeasonTransitionButton
  leagueId={leagueId}
  currentSeasonId={
    preview.currentSeasonId
  }
  currentSeasonYear={
    preview.currentSeasonYear
  }
  nextSeasonYear={
    preview.nextSeasonYear
  }
  playersToCarryForward={
    preview.playersToCarryForward
  }
  readyToTransition={
    preview.readyToTransition
  }
/>
    </div>
  );
}

function Requirement({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950 p-3">
      <span className="text-sm text-slate-300">
        {label}
      </span>

      <span
        className={
          complete
            ? "text-sm font-semibold text-emerald-300"
            : "text-sm font-semibold text-amber-300"
        }
      >
        {complete
          ? "✓ Complete"
          : "Required"}
      </span>
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
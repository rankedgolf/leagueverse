import { SeasonService } from "@/features/seasons/services/season-service";
import { LeagueOperationService } from "@/features/league-operations/services/league-operation-service";

import type { LeagueOperationPhase } from "@/features/league-operations/dto/league-operation-period-dto";

import { LeagueEntitlementService } from "@/features/billing/services/league-entitlement-service";
import { PremiumFeatureLocked } from "@/features/billing/components/premium-feature-locked";

import { FranchiseTagOperationControls } from "@/features/league-operations/components/franchise-tag-operation-controls";
import { ContractExpirationPreview } from "@/features/contract-expirations/components/contract-expiration-preview";
import { FreeAgencyOperationControls } from "@/features/league-operations/components/free-agency-operation-controls";
import { RookieDraftOperationPreview } from "@/features/rookie-draft/components/rookie-draft-operation-preview";
import { RosterCompliancePreview } from "@/features/roster-compliance/components/roster-compliance-preview";
import { SeasonTransitionPreview } from "@/features/season-transition/components/season-transition-preview";
import { FreeAgencyPeriodService } from "@/features/free-agency/services/free-agency-period-service";

type LeagueOperationsPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

const phaseLabels: Record<
  LeagueOperationPhase,
  string
> = {
  franchise_tag:
    "Franchise Tag Window",

  contract_expiration:
    "Contract Expiration",

  free_agency:
    "Free Agency",

  rookie_draft:
    "Rookie Draft",

  roster_compliance:
    "Roster Compliance",

  season_transition:
    "Season Transition",
};

const phaseOrder: LeagueOperationPhase[] = [
  "franchise_tag",
  "contract_expiration",
  "free_agency",
  "rookie_draft",
  "roster_compliance",
  "season_transition",
];

export default async function LeagueOperationsPage({
  params,
}: LeagueOperationsPageProps) {
  const { leagueId } =
    await params;

  /*
   * ------------------------------------------------------------
   * PREMIUM ACCESS
   * ------------------------------------------------------------
   */
  const entitlement =
    await LeagueEntitlementService.getStatus(
      leagueId,
    );

  if (!entitlement.isActivated) {
    return (
      <PremiumFeatureLocked
        leagueId={leagueId}
      />
    );
  }

  /*
   * ------------------------------------------------------------
   * ACTIVE SEASON
   * ------------------------------------------------------------
   */
  const activeSeason =
    await SeasonService.getActiveSeasonByLeague(
      leagueId,
    );

  if (!activeSeason) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-white">
            League Operations
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            No active season has been created for this league yet.
          </p>
        </div>
      </div>
    );
  }

  /*
   * ------------------------------------------------------------
   * OPERATION DATA
   * ------------------------------------------------------------
   */
  const [
    operations,
    freeAgencyPeriod,
  ] =
    await Promise.all([
      LeagueOperationService.getSeasonOperations({
        leagueId,
        seasonId:
          activeSeason.id,
      }),

      FreeAgencyPeriodService.getBySeason({
        leagueId,
        seasonId:
          activeSeason.id,
      }),
    ]);

  const operationMap =
    new Map(
      operations.map(
        (operation) => [
          operation.phase,
          operation,
        ],
      ),
    );

  const expirationOperation =
    operationMap.get(
      "contract_expiration",
    );

  const expirationCompleted =
    expirationOperation?.status ===
    "completed";

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
          Commissioner
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white">
          League Operations
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Manage the offseason calendar and control when each league
          phase opens and closes.
        </p>

        <p className="mt-1 text-sm font-medium text-slate-300">
          {activeSeason.name}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {phaseOrder.map(
          (phase) => {
            const operation =
              operationMap.get(
                phase,
              );

            return (
              <div
                key={phase}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Offseason Phase
                    </p>

                    <h2 className="mt-1 text-xl font-semibold text-white">
                      {
                        phaseLabels[
                          phase
                        ]
                      }
                    </h2>
                  </div>

                  <StatusBadge
                    status={
                      operation?.status ??
                      "not_configured"
                    }
                  />
                </div>

                {operation ? (
                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <InfoCard
                      label="Opens"
                      value={formatDateTime(
                        operation.opensAt,
                      )}
                    />

                    <InfoCard
                      label="Closes"
                      value={formatDateTime(
                        operation.closesAt,
                      )}
                    />

                    <InfoCard
                      label="Opened"
                      value={formatDateTime(
                        operation.openedAt,
                      )}
                    />

                    <InfoCard
                      label="Closed"
                      value={formatDateTime(
                        operation.closedAt,
                      )}
                    />
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-500">
                    This phase has not been configured yet.
                  </p>
                )}

                {phase ===
                "franchise_tag" ? (
                  <FranchiseTagOperationControls
                    leagueId={
                      leagueId
                    }
                    seasonId={
                      activeSeason.id
                    }
                    period={
                      operation
                        ? {
                            status:
                              operation.status,

                            opensAt:
                              operation.opensAt,

                            closesAt:
                              operation.closesAt,
                          }
                        : null
                    }
                  />
                ) : null}

                {phase ===
                "contract_expiration" ? (
                  <ContractExpirationPreview
                    leagueId={
                      leagueId
                    }
                  />
                ) : null}

                {phase ===
                "free_agency" ? (
                  <FreeAgencyOperationControls
                    leagueId={
                      leagueId
                    }
                    seasonId={
                      activeSeason.id
                    }
                    expirationCompleted={
                      expirationCompleted
                    }
                    freeAgencyPeriodId={
                      freeAgencyPeriod?.id ??
                      null
                    }
                    period={
                      operation
                        ? {
                            status:
                              operation.status,

                            opensAt:
                              operation.opensAt,

                            closesAt:
                              operation.closesAt,
                          }
                        : null
                    }
                  />
                ) : null}

                {phase ===
                "rookie_draft" ? (
                  <RookieDraftOperationPreview
                    leagueId={
                      leagueId
                    }
                  />
                ) : null}

                {phase ===
                "roster_compliance" ? (
                  <RosterCompliancePreview
                    leagueId={
                      leagueId
                    }
                    operationSeasonId={
                      activeSeason.id
                    }
                    status={
                      operation?.status ??
                      null
                    }
                  />
                ) : null}

                {phase ===
                "season_transition" ? (
                  <SeasonTransitionPreview
                    leagueId={
                      leagueId
                    }
                  />
                ) : null}
              </div>
            );
          },
        )}
      </div>
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
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>

      <p className="mt-1 text-sm font-medium text-white">
        {value}
      </p>
    </div>
  );
}

function StatusBadge({
  status,
}: {
  status: string;
}) {
  const className =
    status === "open"
      ? "border-emerald-800 bg-emerald-950/40 text-emerald-300"
      : status ===
          "paused"
        ? "border-amber-800 bg-amber-950/40 text-amber-300"
        : status ===
            "completed"
          ? "border-blue-800 bg-blue-950/40 text-blue-300"
          : status ===
              "closed"
            ? "border-slate-700 bg-slate-950 text-slate-300"
            : "border-slate-800 bg-slate-950 text-slate-500";

  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-wide ${className}`}
    >
      {status.replaceAll(
        "_",
        " ",
      )}
    </span>
  );
}

function formatDateTime(
  value: string | null,
): string {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(value),
  );
}
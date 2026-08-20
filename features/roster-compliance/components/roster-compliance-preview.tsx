import { RosterComplianceService } from "@/features/roster-compliance/services/roster-compliance-service";

import { CompleteRosterComplianceButton } from "@/features/roster-compliance/components/complete-roster-compliance-button";

type RosterCompliancePreviewProps = {
  leagueId: string;
  operationSeasonId: string;
  status: string | null;
};

export async function RosterCompliancePreview({
  leagueId,
  operationSeasonId,
  status,
}: RosterCompliancePreviewProps) {
  const compliance =
    await RosterComplianceService.getCompliance({
      leagueId,
    });

  return (
    <div className="mt-5 border-t border-slate-800 pt-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Roster Compliance
      </p>

      <h3 className="mt-2 text-lg font-semibold text-white">
        {compliance.seasonYear} Compliance Check
      </h3>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <InfoCard
          label="Teams"
          value={String(
            compliance.totalTeams,
          )}
        />

        <InfoCard
          label="Compliant"
          value={String(
            compliance.compliantTeams,
          )}
        />

        <InfoCard
          label="Need Action"
          value={String(
            compliance.nonCompliantTeams,
          )}
        />
      </div>

      <div className="mt-4 space-y-3">
        {compliance.teams.map(
          (team) => (
            <div
              key={team.teamId}
              className="rounded-lg border border-slate-800 bg-slate-950 p-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-semibold text-white">
                    {team.teamName}
                  </p>

                  <p
                    className={`mt-1 text-sm font-semibold ${
                      team.compliant
                        ? "text-emerald-300"
                        : "text-red-300"
                    }`}
                  >
                    {team.compliant
                      ? "✓ Compliant"
                      : "Action Required"}
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-sm text-slate-300">
                    Payroll: $
                    {team.committed}
                    {" / $"}
                    {team.salaryCap}
                  </p>

                  <p className="text-sm text-slate-300">
                    Roster:{" "}
                    {team.rosterCount}
                    {" / "}
                    {
                      team.maximumRosterSize
                    }
                  </p>
                </div>
              </div>

              {!team.compliant ? (
                <div className="mt-3 space-y-1">
                  {team.overCap ? (
                    <p className="text-xs text-red-400">
                      Over salary cap by $
                      {Math.abs(
                        team.capSpace,
                      )}
                    </p>
                  ) : null}

                  {team.overRoster ? (
                    <p className="text-xs text-red-400">
                      Over roster limit by{" "}
                      {team.rosterCount -
                        team.maximumRosterSize}{" "}
                      player
                      {team.rosterCount -
                        team.maximumRosterSize ===
                      1
                        ? ""
                        : "s"}
                    </p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ),
        )}
      </div>

      <div className="mt-4 rounded-lg border border-slate-800 bg-slate-950 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
          League Status
        </p>

        <p
          className={`mt-1 text-sm font-semibold ${
            compliance.allCompliant
              ? "text-emerald-300"
              : "text-amber-300"
          }`}
        >
          {compliance.allCompliant
            ? "✓ All teams are compliant"
            : `${compliance.nonCompliantTeams} team${
                compliance.nonCompliantTeams ===
                1
                  ? ""
                  : "s"
              } must take action before the season can advance`}
        </p>
      </div>

      <CompleteRosterComplianceButton
        leagueId={leagueId}
        operationSeasonId={
          operationSeasonId
        }
        allCompliant={
          compliance.allCompliant
        }
        nonCompliantTeams={
          compliance.nonCompliantTeams
        }
        alreadyCompleted={
          status === "completed"
        }
      />
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
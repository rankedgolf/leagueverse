import { SalaryCapService } from "@/features/salary-cap/services/salary-cap-service";
import { TeamSalaryCapTable } from "@/features/salary-cap/components/team-salary-cap-table";

type SalaryCapPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(value);
}

export default async function SalaryCapPage({
  params,
}: SalaryCapPageProps) {
  const { leagueId } = await params;

  const salaryCap =
    await SalaryCapService.getLeagueSalaryCap(leagueId);

  const teamsOverCap = salaryCap.teams.filter(
    (team) => team.currentCapSpace < 0
  ).length;

  const teamsWithFutureRisk =
    salaryCap.teams.filter(
      (team) => team.capHealth !== "healthy"
    ).length;

  const sortedTeams = [...salaryCap.teams].sort(
    (a, b) => b.currentCapSpace - a.currentCapSpace
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">
          Salary Cap
        </h1>

        <p className="mt-1 text-sm text-slate-400">
          Track current cap space, player contracts, contract-year
          usage, and future salary commitments.
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="League Salary Cap"
          value={formatCurrency(salaryCap.salaryCap)}
          detail="Per team"
        />

        <SummaryCard
          label="Future Cap Risks"
          value={String(teamsWithFutureRisk)}
          detail={
            teamsOverCap > 0
              ? `${teamsOverCap} currently over cap`
              : "No teams currently over cap"
          }
          valueClassName={
            teamsWithFutureRisk > 0
              ? "text-amber-400"
              : "text-emerald-400"
          }
        />
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-white">
            Team Cap Positions
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Expand a team to review individual player contracts and
            annual cap commitments.
          </p>
        </div>

        <TeamSalaryCapTable
          teams={sortedTeams}
          activeSeasonId={salaryCap.currentSeasonId}
        />
      </section>
    </div>
  );
}

type SummaryCardProps = {
  label: string;
  value: string;
  detail: string;
  valueClassName?: string;
};

function SummaryCard({
  label,
  value,
  detail,
  valueClassName = "text-white",
}: SummaryCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        {label}
      </p>

      <p
        className={`mt-2 text-2xl font-bold ${valueClassName}`}
      >
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {detail}
      </p>
    </div>
  );
}

import { DemoLeagueService } from "@/features/demo/services/demo-league-service";

import { SalaryCapService } from "@/features/salary-cap/services/salary-cap-service";

import { TeamSalaryCapTable } from "@/features/salary-cap/components/team-salary-cap-table";

export default async function DemoSalaryCapPage() {
  const leagueId =
    DemoLeagueService.getLeagueId();

  const salaryCap =
    await SalaryCapService.getLeagueSalaryCap(
      leagueId,
    );

  return (
    <div className="mx-auto max-w-7xl">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">
          Salary Cap
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          League Salary Cap
        </h1>

        <p className="mt-3 max-w-3xl text-slate-400">
          Explore how contracts, cap space, and
          future commitments affect each franchise.
        </p>
      </div>

      <div className="mt-8">
       <TeamSalaryCapTable
  teams={salaryCap.teams}
  activeSeasonId={salaryCap.currentSeasonId}
/>
      </div>
    </div>
  );
}
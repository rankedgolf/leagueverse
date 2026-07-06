import Link from "next/link";
import type { LeagueDashboardDTO } from "../dto/league-dashboard-dto";

type Props = {
  dashboard: LeagueDashboardDTO;
};

export function LeagueHome({ dashboard }: Props) {
  return (
    <div className="space-y-8">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">
          League Headquarters
        </p>

        <h1 className="mt-2 text-4xl font-bold">
          {dashboard.league.name}
        </h1>

        <p className="mt-2 text-slate-400">
          {dashboard.league.seasonName || "No active season"}
        </p>
      </div>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Teams"
          value={dashboard.stats.teams}
        />

        <StatCard
          title="Members"
          value={dashboard.stats.members}
        />

        <StatCard
          title="Your Role"
          value={dashboard.membership.role}
        />

        <StatCard
          title="Season"
          value={dashboard.league.seasonName || "--"}
        />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold">
          Getting Started
        </h2>

        <div className="mt-4 space-y-3">

          <ChecklistItem
            done={dashboard.checklist.leagueCreated}
            label="League Created"
          />

          <ChecklistItem
            done={dashboard.checklist.hasTeams}
            label="Add your first team"
          />

          <ChecklistItem
            done={dashboard.checklist.hasMembers}
            label="Invite members"
          />

          <ChecklistItem
            done={dashboard.checklist.importedLeague}
            label="Import fantasy league"
          />

          <ChecklistItem
            done={dashboard.checklist.salaryCapConfigured}
            label="Configure salary cap"
          />

        </div>
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold">
          Quick Actions
        </h2>

        <div className="mt-5 flex flex-wrap gap-3">

          <Link
            href={dashboard.quickActions.addTeam}
            className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-950"
          >
            Add Team
          </Link>

          <Link
            href={dashboard.quickActions.inviteMembers}
            className="rounded-lg border border-slate-700 px-4 py-3"
          >
            Invite Members
          </Link>

          <Link
            href={dashboard.quickActions.importLeague}
            className="rounded-lg border border-slate-700 px-4 py-3"
          >
            Import League
          </Link>

        </div>
      </section>
    </div>
  );
}

function StatCard({
  title,
  value,
}: {
  title: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <h3 className="mt-3 text-3xl font-bold">
        {value}
      </h3>
    </div>
  );
}

function ChecklistItem({
  done,
  label,
}: {
  done: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span>{done ? "✅" : "⬜"}</span>

      <span>{label}</span>
    </div>
  );
}
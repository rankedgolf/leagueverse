import Link from "next/link";

import type { LeagueDashboardDTO } from "../dto/league-dashboard-dto";

import { ActivateLeagueButton } from "@/features/billing/components/activate-league-button";

type Props = {
  dashboard: LeagueDashboardDTO;
};

export function LeagueHome({
  dashboard,
}: Props) {
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
          {dashboard.league.seasonName ||
            "No active season"}
        </p>
      </div>

      {dashboard.billing.canManageBilling ? (
        dashboard.billing.isActivated ? (
          <section className="rounded-2xl border border-emerald-800 bg-emerald-950/20 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-400">
              League Activation
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white">
              ✓ League Activated
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              This league is activated for the{" "}
              {dashboard.billing
                .seasonYear ??
                "current"}{" "}
              season.
            </p>
          </section>
        ) : (
          <section className="rounded-2xl border border-violet-800 bg-violet-950/20 p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              League Activation
            </p>

            <h2 className="mt-3 text-2xl font-bold text-white">
              Unlock the LeagueVerse Front Office
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Activate this league for the full season and unlock
              contracts, salary caps, free agency, rookie contracts,
              franchise tags, and offseason operations.
            </p>

            <div className="mt-5">
              <ActivateLeagueButton
                leagueId={
                  dashboard.league.id
                }
              />
            </div>

            <p className="mt-3 text-xs text-slate-500">
              $19 activates this league for the{" "}
              {dashboard.billing
                .seasonYear ??
                "current"}{" "}
              season. Each LeagueVerse league requires its own pass.
            </p>
          </section>
        )
      ) : null}

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Teams"
          value={
            dashboard.stats.teams
          }
        />

        <StatCard
          title="Owners Assigned"
          value={`${dashboard.stats.ownersAssigned} / ${dashboard.stats.teams}`}
        />

        <StatCard
          title="Members"
          value={
            dashboard.stats.members
          }
        />

        <StatCard
          title="Your Role"
          value={
            dashboard.membership.role
          }
        />

        <StatCard
          title="Season"
          value={
            dashboard.league
              .seasonName || "--"
          }
        />
      </section>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold">
          Getting Started
        </h2>

        <div className="mt-4 space-y-3">
          <ChecklistItem
            done={
              dashboard.checklist
                .leagueCreated
            }
            label="League Created"
          />

          <ChecklistItem
            done={
              dashboard.checklist
                .hasTeams
            }
            label="Add your first team"
          />

          <ChecklistItem
            done={
              dashboard.checklist
                .hasMembers
            }
            label="Invite members"
          />

          <ChecklistItem
            done={
              dashboard.checklist
                .importedLeague
            }
            label="Import fantasy league"
          />

          <ChecklistItem
            done={
              dashboard.checklist
                .salaryCapConfigured
            }
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
            href={
              dashboard
                .quickActions
                .addTeam
            }
            className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-950"
          >
            Add Team
          </Link>

          <Link
            href={
              dashboard
                .quickActions
                .inviteMembers
            }
            className="rounded-lg border border-slate-700 px-4 py-3"
          >
            Invite Members
          </Link>

          <Link
            href={
              dashboard
                .quickActions
                .importLeague
            }
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
      <span>
        {done ? "✅" : "⬜"}
      </span>

      <span>
        {label}
      </span>
    </div>
  );
}
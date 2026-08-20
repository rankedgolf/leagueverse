import Link from "next/link";

import { DemoLeagueService } from "@/features/demo/services/demo-league-service";

export default async function DemoLeaguePage() {
  const league =
    await DemoLeagueService.getLeague();

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-violet-400">
          LeagueVerse Demo
        </p>

        <h1 className="mt-2 text-3xl font-bold text-white md:text-4xl">
          Welcome to {league.name}
        </h1>

        <p className="mt-3 max-w-3xl text-base leading-7 text-slate-400">
          Explore a dynasty league powered by LeagueVerse. See how
          contracts, salary caps, rosters, transactions, and draft
          capital come together in one front-office experience.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        <DemoCard
          title="Team Front Offices"
          description="Explore franchise rosters, contracts, and long-term team construction."
          href="/demo/teams"
        />

        <DemoCard
          title="Contracts"
          description="See player salaries, contract lengths, and future commitments."
          href="/demo/contracts"
        />

        <DemoCard
          title="Salary Cap"
          description="See how contract decisions impact each franchise's cap position."
          href="/demo/salary-cap"
        />

        <DemoCard
          title="Draft Capital"
          description="Track future picks and see which franchises are building for tomorrow."
          href="/demo/draft"
        />

        <DemoCard
          title="Transactions"
          description="Follow the moves shaping the league throughout the season."
          href="/demo/transactions"
        />

        <DemoCard
          title="League History"
          description="See the long-term story of a dynasty league in one place."
          href="/demo/history"
        />
      </div>

      <section className="rounded-2xl border border-violet-800 bg-violet-950/20 p-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
          Build Your Own Front Office
        </p>

        <h2 className="mt-3 text-2xl font-bold text-white">
          Ready to bring this experience to your dynasty league?
        </h2>

        <p className="mt-3 max-w-2xl leading-7 text-slate-400">
          Create your LeagueVerse league, import your existing dynasty
          setup, and start managing contracts, salary caps, free agency,
          draft capital, and more.
        </p>

        <Link
          href="/signup"
          className="mt-6 inline-flex rounded-lg bg-violet-700 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-600"
        >
          Start Your League
        </Link>
      </section>
    </div>
  );
}

function DemoCard({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-violet-700 hover:bg-slate-900/80"
    >
      <h2 className="text-xl font-bold text-white group-hover:text-violet-300">
        {title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-400">
        {description}
      </p>

      <p className="mt-5 text-sm font-semibold text-violet-400">
        Explore →
      </p>
    </Link>
  );
}
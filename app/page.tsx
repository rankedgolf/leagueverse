import Link from "next/link";

const frontOfficeFeatures = [
  {
    title: "Multi-Year Contracts",
    description:
      "Stop treating every player like a permanent keeper. Build contracts, manage future obligations, and make long-term roster decisions matter.",
  },
  {
    title: "Salary Cap Strategy",
    description:
      "Every dollar matters. Track current payroll, future commitments, dead cap, and available cap space across multiple seasons.",
  },
  {
    title: "Franchise Tags",
    description:
      "Keep one cornerstone player from hitting the market — at a premium. Retain stars without eliminating player movement.",
  },
  {
    title: "Real Free Agency",
    description:
      "Owners submit competing contract offers while LeagueVerse evaluates player preferences, team situations, and offer strength.",
  },
  {
    title: "Rookie Contracts",
    description:
      "Import rookie draft results and let LeagueVerse automatically place rookies on contracts and rosters.",
  },
  {
    title: "Dead Cap & Releases",
    description:
      "Cutting a player has consequences. Release contracts, calculate savings, and carry guaranteed money as dead cap.",
  },
];

const offseasonSteps = [
  "Franchise Tags",
  "Contract Expirations",
  "Free Agency",
  "Rookie Draft",
  "Roster Compliance",
  "Season Transition",
];

const commissionerFeatures = [
  "League-wide contract management",
  "Custom salary cap rules",
  "Custom rookie draft settings",
  "Commissioner-controlled offseason windows",
  "Roster compliance checks",
  "Automatic season transitions",
];

const engagementFeatures = [
  "Tradeable future draft picks",
  "Contract history",
  "Salary-cap pressure",
  "Free-agent bidding wars",
  "Franchise decisions",
  "Long-term roster building",
];

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
  {/* HERO */}
<section className="relative overflow-hidden border-b border-slate-800">
  <div className="mx-auto max-w-7xl px-6 py-28 text-center">
    <div className="mb-6 flex flex-wrap justify-center gap-3">
      <span className="rounded-full border border-emerald-800 bg-emerald-950/30 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-300">
        ✓ Sleeper One-Click Import
      </span>

      <span className="rounded-full border border-violet-800 bg-violet-950/30 px-4 py-2 text-xs font-bold uppercase tracking-wide text-violet-300">
        ESPN & Yahoo Spreadsheet Import
      </span>

      <span className="rounded-full border border-violet-800 bg-violet-950/30 px-4 py-2 text-xs font-bold uppercase tracking-wide text-violet-300">
        Founding Season • $19
      </span>
    </div>

    <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-400">
      The Front Office for Dynasty Fantasy Football
    </p>

    <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-extrabold leading-tight md:text-7xl">
      Your Fantasy League Deserves More Than Keepers.
    </h1>

    <p className="mx-auto mt-8 max-w-4xl text-xl leading-8 text-slate-300">
      LeagueVerse transforms your dynasty league into a true
      franchise-management experience with contracts, salary caps,
      franchise tags, free agency, rookie deals, future draft picks, dead cap, and a
      complete year-round league operating system.
    </p>

    <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-400">
      Import your Sleeper league automatically, or bring over ESPN,
      Yahoo, and other dynasty leagues with the LeagueVerse spreadsheet
      import template. Keep your existing fantasy platform for weekly
      scoring while LeagueVerse runs the front office.
    </p>

    <div className="mt-10 flex flex-wrap justify-center gap-4">
      <Link
        href="/signup"
        className="rounded-lg bg-violet-700 px-7 py-3 font-semibold text-white hover:bg-violet-600"
      >
        Start Your League
      </Link>

      <Link
        href="/how-it-works"
        className="rounded-lg border border-slate-700 px-7 py-3 font-semibold text-slate-300 hover:bg-slate-900"
      >
        See How It Works
      </Link>
    </div>

    <p className="mt-5 text-sm text-slate-500">
      Sleeper one-click import available now. ESPN, Yahoo, and other
      platforms can migrate through spreadsheet import. Automated ESPN
      and Yahoo syncing is planned.
    </p>
  </div>
</section>

      {/* BIG IDEA */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
            Build a Real Franchise
          </p>

          <h2 className="mx-auto mt-4 max-w-4xl text-4xl font-bold md:text-5xl">
            Every Decision Should Have Consequences.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
            Traditional dynasty leagues let you keep players forever.
            LeagueVerse introduces scarcity, contracts, cap pressure,
            free agency, and long-term financial decisions that force
            owners to think like real general managers.
          </p>
        </div>
      </section>

{/* CURRENT IMPORT OPTIONS */}
<section className="border-b border-slate-800 bg-slate-900/30">
  <div className="mx-auto max-w-6xl px-6 py-20">
    <div className="text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
        Available Today
      </p>

      <h2 className="mt-4 text-4xl font-bold md:text-5xl">
        Bring Your Existing Dynasty League Into LeagueVerse.
      </h2>

      <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
        Sleeper leagues can import automatically. ESPN, Yahoo, MFL,
        Fleaflicker, and custom dynasty leagues can migrate through
        the LeagueVerse spreadsheet import workflow.
      </p>
    </div>

    <div className="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
      <div className="rounded-2xl border border-emerald-800 bg-emerald-950/20 p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Sleeper
        </p>

        <h3 className="mt-3 text-xl font-bold">
          One-Click Import
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Import your existing Sleeper league structure, teams,
          rosters, and dynasty data automatically.
        </p>
      </div>

      <div className="rounded-2xl border border-violet-800 bg-violet-950/20 p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
          ESPN & Yahoo
        </p>

        <h3 className="mt-3 text-xl font-bold">
          Spreadsheet Import
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          Download the LeagueVerse template and migrate teams,
          rosters, contracts, and future draft capital.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Other Platforms
        </p>

        <h3 className="mt-3 text-xl font-bold">
          Manual Migration
        </h3>

        <p className="mt-3 text-sm leading-6 text-slate-400">
          MFL, Fleaflicker, custom spreadsheets, and other dynasty
          leagues can use the same import workflow.
        </p>
      </div>
    </div>

    <div className="mx-auto mt-10 max-w-4xl rounded-xl border border-slate-800 bg-slate-950 p-5 text-center">
      <p className="font-semibold text-white">
        Keep your existing fantasy platform for game day.
      </p>

      <p className="mt-2 text-sm text-slate-400">
        LeagueVerse becomes your front office. Automated ESPN and
        Yahoo synchronization is planned for future releases.
      </p>
    </div>
  </div>
</section>

      {/* CORE FEATURES */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              More Than Dynasty
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              The Front-Office Systems Your League Has Been Missing
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-400">
              Add another level of strategy without replacing the fantasy
              platform your league already knows.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {frontOfficeFeatures.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-7"
              >
                <h3 className="text-xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFSEASON ENGINE */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              The LeagueVerse Offseason Engine
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              The Season Ends. The Strategy Doesn’t.
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-lg text-slate-400">
              Run the entire offseason from one commissioner command center.
              LeagueVerse guides your league from the end of one season
              directly into the next.
            </p>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            {offseasonSteps.map((step, index) => (
              <div
                key={step}
                className="rounded-xl border border-slate-800 bg-slate-950 p-5"
              >
                <p className="text-xs font-semibold text-violet-400">
                  STEP {index + 1}
                </p>

                <p className="mt-2 font-semibold">
                  {step}
                </p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-violet-800 bg-violet-950/20 p-8 text-center">
            <h3 className="text-2xl font-bold">
              One Offseason. One Workflow. No Spreadsheets.
            </h3>

            <p className="mt-4 text-slate-400">
              LeagueVerse tracks every phase, validates league requirements,
              processes contracts, carries rosters forward, and transitions
              your league into the next season.
            </p>
          </div>
        </div>
      </section>

      {/* COMMISSIONER */}
      <section className="border-b border-slate-800">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Built for Commissioners
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Run the League You’ve Always Wanted.
            </h2>

            <p className="mt-6 text-lg leading-8 text-slate-400">
             Stop managing contracts through disconnected tools,
manual calculations, and endless commissioner work.
              LeagueVerse gives commissioners the infrastructure to run
              sophisticated dynasty leagues without the administrative chaos.
            </p>
          </div>

          <div className="grid gap-3">
            {commissionerFeatures.map((feature) => (
              <div
                key={feature}
                className="rounded-xl border border-slate-800 bg-slate-900 p-4 font-medium text-slate-200"
              >
                ✓ {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ENGAGEMENT */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Built for Owners Too
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Give Your League Something to Talk About All Year.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Contracts and cap strategy create decisions that don’t exist
              in standard dynasty leagues. Owners have reasons to trade,
              negotiate, plan, and compete long after the fantasy playoffs end.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {engagementFeatures.map((feature) => (
              <div
                key={feature}
                className="rounded-xl border border-slate-800 bg-slate-900 p-5 text-center font-semibold"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPANION PLATFORM */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Built to Work Alongside Your Fantasy Platform
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Keep Game Day. Upgrade Everything Around It.
            </h2>
          </div>

          <div className="mt-12 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
                Available Integration
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                Your Fantasy Platform
              </h3>

              <p className="mt-4 text-slate-400">
  Continue using Sleeper, ESPN, Yahoo, or your existing fantasy
  platform for scoring, lineups, weekly matchups, statistics,
  and game day.
</p>

<div className="mt-6 space-y-2 text-sm text-slate-300">
  <p>✓ Keep your existing fantasy league</p>
  <p>✓ Keep weekly scoring where it already lives</p>
  <p>✓ Sleeper one-click import available</p>
  <p>✓ ESPN & Yahoo spreadsheet migration available</p>
</div>
            </div>

            <div className="rounded-2xl border border-violet-800 bg-violet-950/20 p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
                Front Office
              </p>

              <h3 className="mt-3 text-2xl font-bold">
                LeagueVerse
              </h3>

              <p className="mt-4 text-slate-400">
                Manage contracts, cap space, free agency, draft capital,
                offseason operations, and the long-term future of your franchise.
              </p>

              <div className="mt-6 space-y-2 text-sm text-slate-300">
                <p>✓ Contracts</p>
                <p>✓ Salary caps</p>
                <p>✓ Free agency</p>
                <p>✓ Franchise tags</p>
                <p>✓ Complete offseason operations</p>
              </div>
            </div>
          </div>

          <p className="mt-8 text-center text-lg font-semibold text-white">
            Run your games on Your Fantasy Platform.
            Run your franchise on LeagueVerse.
          </p>

          <p className="mt-3 text-center text-sm text-slate-500">
            ESPN and Yahoo platform support is planned for future releases.
          </p>
        </div>
      </section>

      {/* FOUNDING SEASON */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="rounded-3xl border border-violet-800 bg-violet-950/20 p-10 text-center md:p-14">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
              Founding Commissioner Program
            </p>

  <h2 className="mt-5 text-5xl font-extrabold">
  $19 Per League.
</h2>

<p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-slate-300">
  No monthly subscription.
  No per-owner pricing.
  One payment unlocks one league for the entire season.
</p>

<div className="mx-auto mt-6 max-w-2xl rounded-xl border border-slate-800 bg-slate-950/50 p-4">
  <p className="text-sm font-medium text-slate-300">
    Built specifically for serious dynasty commissioners who want
    contracts, salary caps, and a true front-office experience.
  </p>
</div>

<Link
  href="/pricing"
  className="mt-8 inline-block rounded-lg bg-violet-700 px-8 py-4 text-lg font-semibold text-white hover:bg-violet-600"
>
  View Founding Pricing
</Link>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section>
        <div className="mx-auto max-w-5xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            Welcome to the Front Office
          </p>

          <h2 className="mt-5 text-5xl font-extrabold">
            Your League Will Never Feel the Same Again.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-slate-400">
            Turn your fantasy dynasty league into a year-round franchise
            experience where contracts matter, cap space matters,
            free agency matters, and every decision shapes the future.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-violet-700 px-8 py-4 text-lg font-semibold text-white hover:bg-violet-600"
            >
              Start Your League
            </Link>

            <Link
              href="/comparison"
              className="rounded-lg border border-slate-700 px-8 py-4 text-lg font-semibold text-slate-300 hover:bg-slate-900"
            >
              See How LeagueVerse Compares
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

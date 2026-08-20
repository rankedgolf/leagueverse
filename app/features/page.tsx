import Link from "next/link";

const frontOfficeSystems = [
  {
    title: "Multi-Year Contracts",
    description:
      "Stop treating every star like a permanent keeper. Create real contract terms, manage future obligations, and force owners to make hard long-term decisions.",
    bullets: [
      "Contract length tracking",
      "Annual salary progression",
      "Guaranteed money",
      "Future cap obligations",
      "Automatic expirations",
    ],
  },
  {
    title: "Salary Cap Management",
    description:
      "Turn roster building into financial strategy. Track current payroll, future cap space, dead cap, and the cost of every decision across multiple seasons.",
    bullets: [
      "League-wide salary cap",
      "Team payroll dashboards",
      "Future cap projections",
      "Dead cap tracking",
      "Roster compliance checks",
    ],
  },
  {
    title: "Franchise Tags",
    description:
      "Give owners one last chance to retain elite talent — but make them pay for it. LeagueVerse keeps stars circulating while still rewarding smart roster management.",
    bullets: [
      "One tag per team",
      "Automatic premium pricing",
      "One-year tag contracts",
      "Tag history tracking",
      "Built into offseason operations",
    ],
  },
  {
    title: "Contract Releases & Dead Cap",
    description:
      "Cutting a bad contract should hurt. LeagueVerse tracks the financial consequences so roster mistakes actually matter.",
    bullets: [
      "Release processing",
      "Cap savings calculations",
      "Guaranteed money consequences",
      "Dead cap charges",
      "Multi-year cap impact",
    ],
  },
];

const offseasonSystems = [
  {
    title: "Contract-Based Free Agency",
    description:
      "Owners submit competing offers. LeagueVerse evaluates contract value, team situations, player preferences, and offer strength to create real bidding wars.",
  },
  {
    title: "AI Player Decisions",
    description:
      "Players do not have to automatically accept the highest offer. Build a market where team quality, guarantees, contract length, and personality can matter.",
  },
  {
    title: "Rookie Draft Integration",
    description:
      "Import rookie draft results and let LeagueVerse automatically build rookie contracts, consume draft picks, and update team rosters.",
  },
  {
    title: "Roster Compliance",
    description:
      "Before a new season begins, LeagueVerse checks every team against salary-cap and roster-size rules so commissioners do not have to.",
  },
  {
    title: "Season Transition",
    description:
      "Move the entire league from one year to the next in a controlled process that carries forward contracts, rosters, league operations, and future seasons.",
  },
  {
    title: "Commissioner Operations Center",
    description:
      "Run every offseason phase from one place instead of juggling spreadsheets, notes, reminders, and manual calculations.",
  },
];

const ownerExperience = [
  "Long-term roster planning",
  "Tradeable future draft capital",
  "Real contract decisions",
  "Free-agent bidding wars",
  "Cap-space strategy",
  "Franchise tag decisions",
  "Roster turnover",
  "Year-round league activity",
];

const commissionerTools = [
  "Custom salary caps",
  "Contract length rules",
  "Rookie contract settings",
  "Free agency windows",
  "Franchise tag windows",
  "Roster limits",
  "Offseason phase control",
  "Automatic season progression",
];

export default function FeaturesPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-24 text-center">
          <div className="mb-6 flex flex-wrap justify-center gap-3">
            <span className="rounded-full border border-emerald-800 bg-emerald-950/30 px-4 py-2 text-xs font-bold uppercase tracking-wide text-emerald-300">
  ✓ Sleeper One-Click Import
</span>

<span className="rounded-full border border-violet-800 bg-violet-950/30 px-4 py-2 text-xs font-bold uppercase tracking-wide text-violet-300">
  ESPN & Yahoo Spreadsheet Import
</span>

<span className="rounded-full border border-violet-800 bg-violet-950/30 px-4 py-2 text-xs font-bold uppercase tracking-wide text-violet-300">
  Founding Season • $19 Per League
</span>
          </div>

          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-400">
            LeagueVerse Features
          </p>

          <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-extrabold leading-tight md:text-7xl">
            Everything Your Dynasty League Has Been Missing.
          </h1>

          <p className="mx-auto mt-8 max-w-4xl text-xl leading-8 text-slate-300">
            LeagueVerse adds the contracts, cap strategy, free agency,
            commissioner controls, and offseason infrastructure that turn a
            standard dynasty league into a true franchise-management experience.
          </p>

         <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-400">
  Import your Sleeper league automatically, or bring over ESPN,
  Yahoo, and other dynasty leagues with the LeagueVerse spreadsheet
  import template. Keep your existing fantasy platform for game day
  while LeagueVerse runs the front office.
</p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-violet-700 px-7 py-3 font-semibold text-white hover:bg-violet-600"
            >
              Start Your League
            </Link>

            <Link
              href="/comparison"
              className="rounded-lg border border-slate-700 px-7 py-3 font-semibold text-slate-300 hover:bg-slate-900"
            >
              Compare Platforms
            </Link>
          </div>

          <p className="mt-5 text-sm text-slate-500">
  Sleeper one-click import available now. ESPN, Yahoo, and other
  platforms can migrate through spreadsheet import. Automated ESPN
  and Yahoo syncing is planned.
</p>
        </div>
      </section>

{/* INTEGRATION */}
<section className="border-b border-slate-800 bg-slate-900/30">
  <div className="mx-auto max-w-7xl px-6 py-20">
    <div className="text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
        Available Today
      </p>

      <h2 className="mt-4 text-4xl font-bold md:text-5xl">
        Bring Your Existing Dynasty League Into LeagueVerse.
      </h2>

      <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
        Sleeper commissioners can import automatically. ESPN, Yahoo, MFL,
        Fleaflicker, and custom dynasty leagues can migrate through the
        LeagueVerse spreadsheet import workflow.
      </p>
    </div>

    <div className="mx-auto mt-12 grid max-w-6xl gap-6 lg:grid-cols-3">
      <div className="rounded-2xl border border-emerald-800 bg-emerald-950/20 p-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Sleeper
        </p>

        <h3 className="mt-3 text-2xl font-bold">
          One-Click Import
        </h3>

        <p className="mt-4 leading-7 text-slate-400">
          Bring over your existing league structure, teams, rosters,
          and dynasty data automatically.
        </p>
      </div>

      <div className="rounded-2xl border border-violet-800 bg-violet-950/20 p-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
          ESPN & Yahoo
        </p>

        <h3 className="mt-3 text-2xl font-bold">
          Spreadsheet Import
        </h3>

        <p className="mt-4 leading-7 text-slate-400">
          Use the LeagueVerse import template to migrate teams, rosters,
          contracts, and future draft capital.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-7">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Game Day
        </p>

        <h3 className="mt-3 text-2xl font-bold">
          Keep Your Existing Platform
        </h3>

        <p className="mt-4 leading-7 text-slate-400">
          Continue using Sleeper, ESPN, Yahoo, or your existing platform
          for scoring, lineups, matchups, and weekly fantasy football.
        </p>
      </div>
    </div>

    <div className="mx-auto mt-10 max-w-4xl rounded-xl border border-slate-800 bg-slate-950 p-5 text-center">
      <p className="font-semibold text-white">
        Import from multiple fantasy platforms today.
      </p>

      <p className="mt-2 text-sm text-slate-400">
        Sleeper supports one-click import. ESPN, Yahoo, and other leagues
        can migrate through spreadsheet import. Automated synchronization
        for additional platforms is planned.
      </p>
    </div>
  </div>
</section>

      {/* FRONT OFFICE SYSTEMS */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Front Office Infrastructure
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Make Every Roster Decision Matter.
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-400">
              LeagueVerse introduces the financial and contractual consequences
              that traditional dynasty leagues are missing.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {frontOfficeSystems.map((feature) => (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-8"
              >
                <h3 className="text-2xl font-bold">
                  {feature.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {feature.description}
                </p>

                <div className="mt-6 space-y-2">
                  {feature.bullets.map((bullet) => (
                    <p
                      key={bullet}
                      className="text-sm text-slate-300"
                    >
                      ✓ {bullet}
                    </p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FREE AGENCY */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
                Free Agency Reimagined
              </p>

              <h2 className="mt-4 text-4xl font-bold md:text-5xl">
                Free Agency Should Feel Like an Event.
              </h2>

              <p className="mt-6 text-lg leading-8 text-slate-400">
                Owners submit offers. Players evaluate them. Contracts get
                accepted, declined, or outbid. LeagueVerse turns the offseason
                into something your entire league actually wants to follow.
              </p>

              <p className="mt-5 text-lg leading-8 text-slate-400">
                Instead of silently assigning free agents, you create real
                markets, competition, negotiations, and uncertainty.
              </p>
            </div>

            <div className="rounded-2xl border border-violet-800 bg-violet-950/20 p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
                Free Agency Engine
              </p>

              <div className="mt-5 space-y-4">
                <FeatureLine text="Competing contract offers" />
                <FeatureLine text="Automated player decisions" />
                <FeatureLine text="Offer scoring and comparison" />
                <FeatureLine text="Player personality variation" />
                <FeatureLine text="Commissioner-controlled windows" />
                <FeatureLine text="Automatic roster and contract updates" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* OFFSEASON ENGINE */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              The Offseason Engine
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Your League Does Not Stop When the Fantasy Season Ends.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              LeagueVerse gives commissioners a structured offseason workflow
              that keeps the league moving and keeps owners engaged.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {offseasonSystems.map((feature) => (
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

      {/* OWNER EXPERIENCE */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              More Strategy. More Engagement.
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Give Owners More Reasons to Care All Year.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              LeagueVerse creates decisions that simply do not exist in a
              traditional keeper league.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {ownerExperience.map((feature) => (
              <div
                key={feature}
                className="rounded-xl border border-slate-800 bg-slate-950 p-5 text-center font-semibold"
              >
                {feature}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMMISSIONER TOOLS */}
      <section className="border-b border-slate-800">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Commissioner Control
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Powerful Enough for Complex Leagues. Simple Enough to Actually Run.
            </h2>

           <p className="mt-6 text-lg leading-8 text-slate-400">
  Deep dynasty formats usually come with disconnected tools,
  manual cap tracking, homemade rules, and commissioner headaches.
</p>

            <p className="mt-5 text-lg leading-8 text-slate-400">
              LeagueVerse turns those custom rules into real league systems.
            </p>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {commissionerTools.map((feature) => (
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

  {/* COMPANION PLATFORM */}
<section className="border-b border-slate-800 bg-slate-900/30">
  <div className="mx-auto max-w-6xl px-6 py-20">
    <div className="text-center">
      <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
        One League. Two Jobs.
      </p>

      <h2 className="mt-4 text-4xl font-bold md:text-5xl">
        Your Fantasy Platform Runs Game Day. LeagueVerse Runs the Front Office.
      </h2>

      <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
        There is no need to replace the fantasy experience your league
        already knows. LeagueVerse adds the systems around it.
      </p>
    </div>

    <div className="mt-12 grid gap-6 md:grid-cols-2">
      <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
          Your Fantasy Platform
        </p>

        <h3 className="mt-3 text-2xl font-bold">
          Game Day
        </h3>

        <div className="mt-5 space-y-2 text-slate-400">
          <p>✓ Live scoring</p>
          <p>✓ Weekly lineups</p>
          <p>✓ Matchups</p>
          <p>✓ Player stats</p>
          <p>✓ League schedules</p>
        </div>
      </div>

      <div className="rounded-2xl border border-violet-800 bg-violet-950/20 p-8">
        <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
          LeagueVerse
        </p>

        <h3 className="mt-3 text-2xl font-bold">
          Front Office
        </h3>

        <div className="mt-5 space-y-2 text-slate-400">
          <p>✓ Contracts</p>
          <p>✓ Salary caps</p>
          <p>✓ Free agency</p>
          <p>✓ Draft capital</p>
          <p>✓ Offseason operations</p>
        </div>
      </div>
    </div>

    <p className="mt-8 text-center text-lg font-semibold text-white">
      Run your games on your fantasy platform.
      Run your franchise on LeagueVerse.
    </p>

    <p className="mt-3 text-center text-sm text-slate-500">
      Sleeper supports one-click import. ESPN, Yahoo, and other leagues
      can migrate through spreadsheet import. Automated syncing for
      additional platforms is planned.
    </p>
  </div>
</section>

      {/* FOUNDING SEASON */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="rounded-3xl border border-violet-800 bg-violet-950/20 p-10 text-center md:p-14">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
  Founding Commissioner Pass
</p>

<h2 className="mt-5 text-5xl font-extrabold">
  Every Feature. $19 Per League.
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
            This Is Dynasty Evolved
          </p>

          <h2 className="mt-5 text-5xl font-extrabold">
            Build a League Owners Never Want to Leave.
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-slate-400">
            More strategy. More consequences. More offseason drama.
            More reasons to stay engaged every month of the year.
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
              Compare LeagueVerse
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function FeatureLine({
  text,
}: {
  text: string;
}) {
  return (
    <div className="rounded-xl border border-violet-900/70 bg-slate-950/60 p-4 font-medium text-slate-200">
      ✓ {text}
    </div>
  );
}
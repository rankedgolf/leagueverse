import Link from "next/link";

const offseasonTimeline = [
  {
    step: "01",
    title: "Fantasy Season Ends",
    description:
      "Your fantasy season finishes on your existing platform. LeagueVerse then takes over the front-office side of the offseason.",
  },
  {
    step: "02",
    title: "Contract Expirations",
    description:
      "Expiring contracts are automatically processed. Players who reach the end of their deals become unrestricted free agents.",
  },
  {
    step: "03",
    title: "Franchise Tags",
    description:
      "Each team can retain one cornerstone player by applying a franchise tag at a premium salary.",
  },
  {
    step: "04",
    title: "Free Agency",
    description:
      "Owners compete for available players by submitting contract offers. Players evaluate those offers before signing.",
  },
  {
    step: "05",
    title: "Rookie Draft",
    description:
      "Run your rookie draft on your fantasy platform, then bring the results into LeagueVerse so draft picks, rookies, contracts, and rosters stay aligned.",
  },
  {
    step: "06",
    title: "Rookie Contracts",
    description:
      "LeagueVerse automatically creates rookie contracts and assigns drafted players to their new team rosters.",
  },
  {
    step: "07",
    title: "Roster Compliance",
    description:
      "The system validates salary caps, roster limits, and league rules before allowing the season to advance.",
  },
  {
    step: "08",
    title: "Season Transition",
    description:
      "Contracts, rosters, draft capital, and league operations transition into the next season so your league is ready to go again.",
  },
];

const fantasyPlatformFeatures = [
  "Live fantasy scoring",
  "Starting lineups",
  "Weekly schedules",
  "Head-to-head matchups",
  "Player statistics",
  "Game-day experience",
];

const leagueVerseFeatures = [
  "Multi-year contracts",
  "Salary caps",
  "Guaranteed money and dead cap",
  "Franchise tags",
  "Contract-based free agency",
  "Rookie contracts",
  "Future draft capital",
  "Offseason operations",
  "Season transitions",
];

const importSteps = [
  {
    step: "1",
    title: "Create Your LeagueVerse League",
    description:
      "Create the LeagueVerse league that will become the front office for your existing dynasty league.",
  },
  {
    step: "2",
    title: "Choose Your Import Method",
    description:
      "Sleeper leagues can use one-click import. ESPN, Yahoo, MFL, Fleaflicker, and other leagues can migrate through the LeagueVerse spreadsheet import template.",
  },
  {
    step: "3",
    title: "Review Teams & Rosters",
    description:
      "Confirm imported teams, owners, players, rosters, contracts, and future draft capital before moving forward.",
  },
  {
    step: "4",
    title: "Set Your Front-Office Rules",
    description:
      "Choose your salary cap, maximum contract length, rookie settings, free agency rules, franchise tag rules, and other commissioner preferences.",
  },
  {
    step: "5",
    title: "Add or Confirm Contracts",
    description:
      "Assign or import player contracts so every franchise begins with the correct salaries, years, guarantees, and future obligations.",
  },
  {
    step: "6",
    title: "Invite Your League",
    description:
      "Owners join LeagueVerse to manage their franchises while your existing fantasy platform continues handling weekly gameplay and scoring.",
  },
];

const contractExamples = [
  {
    player: "Elite WR",
    contract: "4 years • $28",
    explanation:
      "A cornerstone player with a major long-term cap commitment.",
  },
  {
    player: "Veteran RB",
    contract: "2 years • $12",
    explanation:
      "Useful production now, but with a shorter decision window.",
  },
  {
    player: "Rookie QB",
    contract: "1 year • $5",
    explanation:
      "A low-cost young asset with major future roster implications.",
  },
];

const strategyExamples = [
  {
    title: "Trade Value Changes",
    description:
      "A star on a cheap three-year deal can be far more valuable than the same player on an expensive expiring contract.",
  },
  {
    title: "Cap Space Becomes an Asset",
    description:
      "Owners can build around flexibility, absorb expensive contracts, or preserve room for future free agency.",
  },
  {
    title: "Bad Contracts Hurt",
    description:
      "Guaranteed money and dead cap mean roster mistakes can have consequences beyond one season.",
  },
  {
    title: "Free Agency Matters",
    description:
      "Expiring contracts continuously return talent to the market, creating real competition and roster turnover.",
  },
];

export default function HowItWorksPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
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
            How LeagueVerse Works
          </p>

          <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-extrabold leading-tight md:text-7xl">
            Turn Your Dynasty League Into a Front Office Simulation.
          </h1>

          <p className="mx-auto mt-8 max-w-4xl text-xl leading-8 text-slate-300">
            Keep your existing fantasy platform for scoring, lineups,
            schedules, matchups, and game day. Add LeagueVerse for
            contracts, salary caps, free agency, franchise tags,
            rookie deals, future draft capital, and year-round league
            management.
          </p>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-400">
            Sleeper leagues can import automatically. ESPN, Yahoo,
            MFL, Fleaflicker, and other dynasty leagues can migrate
            through the LeagueVerse spreadsheet import workflow.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-violet-700 px-7 py-3 font-semibold text-white hover:bg-violet-600"
            >
              Start Your League
            </Link>

            <Link
              href="/pricing"
              className="rounded-lg border border-slate-700 px-7 py-3 font-semibold text-slate-300 hover:bg-slate-900"
            >
              View Founding Pricing
            </Link>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Automated ESPN and Yahoo synchronization is planned for
            future releases.
          </p>
        </div>
      </section>

      {/* THE CORE MODEL */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              The Basic Idea
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Two Platforms. Two Different Jobs.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              LeagueVerse does not try to replace the fantasy platform
              your league already knows. It adds the missing
              front-office layer around it.
            </p>
          </div>

          <div className="mt-14 grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-900 bg-emerald-950/10 p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
                Game Day
              </p>

              <h3 className="mt-3 text-3xl font-bold">
                Your Fantasy Platform
              </h3>

              <p className="mt-4 leading-7 text-slate-400">
                Keep the weekly fantasy experience your league already
                knows.
              </p>

              <div className="mt-6 space-y-3">
                {fantasyPlatformFeatures.map((feature) => (
                  <p
                    key={feature}
                    className="text-slate-300"
                  >
                    ✓ {feature}
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-violet-800 bg-violet-950/20 p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
                Front Office
              </p>

              <h3 className="mt-3 text-3xl font-bold">
                LeagueVerse
              </h3>

              <p className="mt-4 leading-7 text-slate-400">
                Manage the long-term economics, contracts, draft
                capital, and offseason decisions behind every
                franchise.
              </p>

              <div className="mt-6 space-y-3">
                {leagueVerseFeatures.map((feature) => (
                  <p
                    key={feature}
                    className="text-slate-300"
                  >
                    ✓ {feature}
                  </p>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-violet-800 bg-violet-950/20 p-6 text-center">
            <p className="text-lg font-semibold">
              Run your games on your fantasy platform. Run your
              franchise on LeagueVerse.
            </p>
          </div>
        </div>
      </section>

      {/* GETTING STARTED */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-400">
              Getting Started
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              From Fantasy League to Front Office.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Start with the dynasty league you already have. Import
              your league, configure the front-office rules, and let
              LeagueVerse handle the systems your fantasy platform
              does not.
            </p>
          </div>

          <div className="mx-auto mt-14 max-w-5xl space-y-5">
            {importSteps.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-7"
              >
                <div className="flex flex-col gap-5 sm:flex-row">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-emerald-800 bg-emerald-950/30 text-lg font-bold text-emerald-300">
                    {item.step}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-3 leading-7 text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PLATFORM SUPPORT */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Platform Support
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Bring Your League From More Than One Platform.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Sleeper leagues can use one-click import. ESPN, Yahoo,
              and other leagues can migrate today through the
              LeagueVerse spreadsheet import workflow.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-5xl gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-emerald-800 bg-emerald-950/20 p-6 text-center">
              <h3 className="text-xl font-bold">
                Sleeper
              </h3>

              <p className="mt-3 text-sm font-bold uppercase tracking-wide text-emerald-300">
                One-Click Import
              </p>
            </div>

            <div className="rounded-2xl border border-violet-800 bg-violet-950/20 p-6 text-center">
              <h3 className="text-xl font-bold">
                ESPN
              </h3>

              <p className="mt-3 text-sm font-bold uppercase tracking-wide text-violet-300">
                Spreadsheet Import
              </p>
            </div>

            <div className="rounded-2xl border border-violet-800 bg-violet-950/20 p-6 text-center">
              <h3 className="text-xl font-bold">
                Yahoo
              </h3>

              <p className="mt-3 text-sm font-bold uppercase tracking-wide text-violet-300">
                Spreadsheet Import
              </p>
            </div>

            <div className="rounded-2xl border border-slate-700 bg-slate-950 p-6 text-center">
              <h3 className="text-xl font-bold">
                Other
              </h3>

              <p className="mt-3 text-sm font-bold uppercase tracking-wide text-slate-400">
                Spreadsheet Import
              </p>
            </div>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Spreadsheet imports do not automatically synchronize
            weekly activity. Automated ESPN and Yahoo syncing is
            planned.
          </p>
        </div>
      </section>

      {/* CONTRACT EXPLANATION */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Contracts Change Dynasty
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Players Aren&apos;t Permanent Keepers Anymore.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Owners build rosters through contracts and salary
              management. Every player has a cost, a timeline, and a
              long-term impact.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {contractExamples.map((contract) => (
              <div
                key={contract.player}
                className="rounded-2xl border border-violet-800 bg-violet-950/20 p-8 text-center"
              >
                <p className="text-sm uppercase tracking-wide text-violet-400">
                  Example Contract
                </p>

                <h3 className="mt-4 text-2xl font-bold">
                  {contract.player}
                </h3>

                <p className="mt-4 text-xl font-semibold text-white">
                  {contract.contract}
                </p>

                <p className="mt-4 text-sm leading-6 text-slate-400">
                  {contract.explanation}
                </p>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
            <p className="text-lg leading-8 text-slate-300">
              When contracts expire, players can return to free
              agency. Owners have to decide who is worth the money,
              who is worth keeping, and when it is time to move on.
            </p>
          </div>
        </div>
      </section>

      {/* STRATEGY */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              A Different Kind of Dynasty
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Suddenly, Everything Has Another Layer.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {strategyExamples.map((item) => (
              <div
                key={item.title}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-8"
              >
                <h3 className="text-2xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-4 leading-7 text-slate-400">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFSEASON TIMELINE */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              The LeagueVerse Offseason Engine
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              The Fantasy Season Ends.
              <span className="block text-violet-400">
                Your League Doesn&apos;t.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Every offseason follows a structured workflow that
              takes your league from one season directly into the
              next.
            </p>
          </div>

          <div className="mt-14 space-y-6">
            {offseasonTimeline.map((item) => (
              <div
                key={item.step}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-8"
              >
                <div className="flex flex-col gap-4 md:flex-row">
                  <div className="min-w-[80px] text-5xl font-extrabold text-violet-500">
                    {item.step}
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold">
                      {item.title}
                    </h3>

                    <p className="mt-4 leading-8 text-slate-400">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-4xl rounded-2xl border border-violet-800 bg-violet-950/20 p-8 text-center">
            <h3 className="text-2xl font-bold">
              One Offseason. One Workflow. No Spreadsheet Chaos.
            </h3>

            <p className="mt-4 leading-7 text-slate-400">
              A spreadsheet can help migrate your league once.
              LeagueVerse gives you a system to actually run it
              afterward — tracking each phase, processing roster
              changes, checking compliance, and transitioning into
              the next season.
            </p>
          </div>
        </div>
      </section>

      {/* WHY IT MATTERS */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
            Why It Matters
          </p>

          <h2 className="mt-4 text-4xl font-bold md:text-5xl">
            This Changes the Way Your League Thinks.
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8">
              <h3 className="text-2xl font-bold">
                More Strategy
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Every contract affects future roster flexibility,
                trade value, and cap space.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8">
              <h3 className="text-2xl font-bold">
                More Consequences
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Bad deals, guarantees, and roster mistakes can follow
                a franchise into future seasons.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-8">
              <h3 className="text-2xl font-bold">
                More Engagement
              </h3>

              <p className="mt-4 leading-8 text-slate-400">
                Contracts, free agency, draft capital, and offseason
                decisions give owners reasons to stay active
                year-round.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOUNDING OFFER */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="rounded-3xl border border-violet-800 bg-violet-950/20 p-10 text-center md:p-14">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
              Founding Commissioner Pass
            </p>

            <h2 className="mt-5 text-5xl font-extrabold">
              $19 Per League.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-slate-300">
              One payment unlocks one LeagueVerse league for the
              entire season.
            </p>

            <p className="mt-4 text-lg text-slate-500">
              No monthly subscription. No per-owner pricing.
            </p>

            <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-sm font-medium text-slate-300">
                Built specifically for serious dynasty commissioners
                who want contracts, salary caps, and a true
                front-office experience.
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

      {/* CTA */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-400">
            Ready to Build Your Franchise?
          </p>

          <h2 className="mt-5 text-6xl font-extrabold">
            Bring Your Dynasty League to LeagueVerse.
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-slate-400">
            Add contracts. Add cap strategy. Add a real offseason.
            Keep the game-day experience your league already loves.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-violet-700 px-10 py-5 text-xl font-semibold text-white hover:bg-violet-600"
            >
              Start Your League
            </Link>

            <Link
              href="/pricing"
              className="rounded-lg border border-slate-700 px-10 py-5 text-xl font-semibold text-slate-300 hover:bg-slate-900"
            >
              View $19 Founding Pass
            </Link>
          </div>

          <p className="mt-6 text-sm text-slate-500">
            Sleeper one-click import available now. ESPN, Yahoo, and
            other leagues can migrate through spreadsheet import.
          </p>
        </div>
      </section>
    </main>
  );
}
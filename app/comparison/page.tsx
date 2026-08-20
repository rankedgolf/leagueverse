import Link from "next/link";

const comparisonRows = [
  {
    feature: "Live Fantasy Scoring",
    sleeper: "✓",
    espn: "✓",
    yahoo: "✓",
    leagueVerse: "Uses your fantasy platform",
  },
  {
    feature: "Lineup Management",
    sleeper: "✓",
    espn: "✓",
    yahoo: "✓",
    leagueVerse: "Handled by your fantasy platform",
  },
  {
    feature: "Dynasty / Keeper Rosters",
    sleeper: "✓",
    espn: "✓",
    yahoo: "✓",
    leagueVerse: "Adds front-office management",
  },
  {
    feature: "Future Draft Pick Tracking",
    sleeper: "✓",
    espn: "Varies by format",
    yahoo: "Varies by format",
    leagueVerse: "✓",
  },
  {
    feature: "Salary Cap Drafts",
    sleeper: "Auction format",
    espn: "✓",
    yahoo: "✓",
    leagueVerse: "Not the core purpose",
  },
  {
    feature: "Keeper Salary Support",
    sleeper: "Limited",
    espn: "✓",
    yahoo: "✓",
    leagueVerse: "✓",
  },
  {
    feature: "Multi-Year Player Contracts",
    sleeper: "—",
    espn: "—",
    yahoo: "—",
    leagueVerse: "✓",
  },
  {
    feature: "Contract Year Tracking",
    sleeper: "—",
    espn: "—",
    yahoo: "—",
    leagueVerse: "✓",
  },
  {
    feature: "Guaranteed Money",
    sleeper: "—",
    espn: "—",
    yahoo: "—",
    leagueVerse: "✓",
  },
  {
    feature: "Dead Cap",
    sleeper: "—",
    espn: "—",
    yahoo: "—",
    leagueVerse: "✓",
  },
  {
    feature: "Contract Expiration Processing",
    sleeper: "—",
    espn: "—",
    yahoo: "—",
    leagueVerse: "✓",
  },
  {
    feature: "Franchise Tags",
    sleeper: "—",
    espn: "—",
    yahoo: "—",
    leagueVerse: "✓",
  },
  {
    feature: "Contract-Based Free Agency",
    sleeper: "—",
    espn: "—",
    yahoo: "—",
    leagueVerse: "✓",
  },
  {
    feature: "Automated Player Offer Decisions",
    sleeper: "—",
    espn: "—",
    yahoo: "—",
    leagueVerse: "✓",
  },
  {
    feature: "Rookie Contract Automation",
    sleeper: "—",
    espn: "—",
    yahoo: "—",
    leagueVerse: "✓",
  },
  {
    feature: "Dead-Cap / Roster Compliance",
    sleeper: "—",
    espn: "—",
    yahoo: "—",
    leagueVerse: "✓",
  },
  {
    feature: "Structured Offseason Workflow",
    sleeper: "—",
    espn: "—",
    yahoo: "—",
    leagueVerse: "✓",
  },
];

const integrationPlatforms = [
  {
    name: "Sleeper",
    status: "One-Click Import",
    statusType: "automatic",
    description:
      "Import your Sleeper dynasty league automatically and continue using Sleeper for scoring, lineups, matchups, and game day.",
  },
  {
    name: "ESPN",
    status: "Spreadsheet Import",
    statusType: "manual",
    description:
      "Migrate ESPN teams, rosters, contracts, and future draft capital using the LeagueVerse import workbook. Automated synchronization is planned.",
  },
  {
    name: "Yahoo",
    status: "Spreadsheet Import",
    statusType: "manual",
    description:
      "Migrate your Yahoo dynasty league using the LeagueVerse spreadsheet import workflow while continuing to use Yahoo for weekly gameplay.",
  },
];

export default function ComparisonPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-20 text-center">
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

          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            Platform Comparison
          </p>

          <h1 className="mx-auto mt-5 max-w-5xl text-5xl font-extrabold leading-tight md:text-6xl">
            Keep Your Fantasy Platform.
            <span className="block text-violet-400">
              Add a Real Front Office.
            </span>
          </h1>

          <p className="mx-auto mt-7 max-w-3xl text-lg leading-8 text-slate-400">
            Sleeper, ESPN, and Yahoo are built around fantasy gameplay.
            LeagueVerse adds contracts, salary-cap strategy, franchise
            tags, free agency, rookie contracts, draft capital, and
            offseason infrastructure.
          </p>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-300">
            Sleeper leagues can import automatically. ESPN and Yahoo
            leagues can migrate today through the LeagueVerse spreadsheet
            import workflow while continuing to use their existing platform
            for weekly gameplay and scoring.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-violet-700 px-6 py-3 font-semibold text-white hover:bg-violet-600"
            >
              Start Your League
            </Link>

            <Link
              href="/features"
              className="rounded-lg border border-slate-700 px-6 py-3 font-semibold text-slate-300 hover:bg-slate-900"
            >
              Explore Features
            </Link>
          </div>

          <p className="mt-5 text-sm text-slate-500">
            Automated ESPN and Yahoo synchronization is planned for
            future releases.
          </p>
        </div>
      </section>

      {/* INTEGRATION STATUS */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Platform Support
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Bring Your League Into LeagueVerse Today.
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-400">
              Choose the import method that fits your current league.
              Sleeper offers the fastest automated path, while ESPN and
              Yahoo commissioners can migrate through the LeagueVerse
              spreadsheet importer.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {integrationPlatforms.map((platform) => {
              const automatic =
                platform.statusType === "automatic";

              return (
                <div
                  key={platform.name}
                  className={`rounded-2xl border p-7 ${
                    automatic
                      ? "border-emerald-800 bg-emerald-950/10"
                      : "border-violet-800 bg-violet-950/10"
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-2xl font-bold">
                      {platform.name}
                    </h3>

                    <span
                      className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                        automatic
                          ? "border-emerald-800 bg-emerald-950/30 text-emerald-300"
                          : "border-violet-800 bg-violet-950/30 text-violet-300"
                      }`}
                    >
                      {platform.status}
                    </span>
                  </div>

                  <p className="mt-5 leading-7 text-slate-400">
                    {platform.description}
                  </p>
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center text-sm text-slate-500">
            Spreadsheet imports are migrations and do not automatically
            synchronize weekly ESPN or Yahoo activity.
          </p>
        </div>
      </section>

      {/* TWO PLATFORM MODEL */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-16">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Two Platforms. Two Jobs.
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Your Fantasy Platform Runs Game Day.
              <span className="block text-violet-400">
                LeagueVerse Runs the Front Office.
              </span>
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-emerald-900 bg-emerald-950/10 p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-400">
                Your Scoring Platform
              </p>

              <h3 className="mt-3 text-3xl font-bold">
                Sleeper, ESPN, Yahoo & More
              </h3>

              <p className="mt-4 leading-7 text-slate-400">
                Continue using the fantasy experience your league already
                knows for the weekly season.
              </p>

              <div className="mt-6 space-y-2 text-sm text-slate-300">
                <p>✓ Live scoring</p>
                <p>✓ Weekly matchups</p>
                <p>✓ Starting lineups</p>
                <p>✓ Player statistics</p>
                <p>✓ League schedules</p>
                <p>✓ Game-day experience</p>
              </div>
            </div>

            <div className="rounded-2xl border border-violet-800 bg-violet-950/20 p-8">
              <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
                Your Front Office
              </p>

              <h3 className="mt-3 text-3xl font-bold">
                LeagueVerse
              </h3>

              <p className="mt-4 leading-7 text-slate-400">
                LeagueVerse manages the long-term economics, contracts,
                draft capital, and offseason strategy that turn your fantasy
                league into a franchise.
              </p>

              <div className="mt-6 space-y-2 text-sm text-slate-300">
                <p>✓ Multi-year contracts</p>
                <p>✓ Salary-cap management</p>
                <p>✓ Guaranteed money and dead cap</p>
                <p>✓ Franchise tags</p>
                <p>✓ Contract-based free agency</p>
                <p>✓ Future draft capital</p>
                <p>✓ Complete offseason operations</p>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-xl border border-violet-800 bg-violet-950/20 p-6 text-center">
            <p className="text-lg font-semibold text-white">
              LeagueVerse is a companion platform — not a scoring replacement.
            </p>

            <p className="mt-2 text-sm text-slate-400">
              Run your games on your fantasy platform.
              Run your franchise on LeagueVerse.
            </p>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              Feature Comparison
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Compare the Experience
            </h2>

            <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-400">
              Traditional fantasy platforms focus primarily on gameplay.
              LeagueVerse adds the front-office systems for leagues
              that want deeper long-term strategy.
            </p>
          </div>

          <div className="mt-12 overflow-x-auto rounded-2xl border border-slate-800">
            <table className="min-w-[900px] w-full">
              <thead className="bg-slate-900">
                <tr className="border-b border-slate-800">
                  <th className="p-5 text-left">
                    Feature
                  </th>

                  <th className="p-5 text-center">
                    <div>Sleeper</div>

                    <div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-emerald-400">
                      One-Click Import
                    </div>
                  </th>

                  <th className="p-5 text-center">
                    <div>ESPN</div>

                    <div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-violet-400">
                      Spreadsheet Import
                    </div>
                  </th>

                  <th className="p-5 text-center">
                    <div>Yahoo</div>

                    <div className="mt-2 text-[10px] font-bold uppercase tracking-wide text-violet-400">
                      Spreadsheet Import
                    </div>
                  </th>

                  <th className="bg-violet-950/30 p-5 text-center text-violet-300">
                    LeagueVerse
                  </th>
                </tr>
              </thead>

              <tbody>
                {comparisonRows.map((row) => (
                  <tr
                    key={row.feature}
                    className="border-b border-slate-800 last:border-b-0"
                  >
                    <td className="p-5 font-medium text-white">
                      {row.feature}
                    </td>

                    <ComparisonCell
                      value={row.sleeper}
                    />

                    <ComparisonCell
                      value={row.espn}
                    />

                    <ComparisonCell
                      value={row.yahoo}
                    />

                    <td className="bg-violet-950/10 p-5 text-center font-semibold text-violet-300">
                      {row.leagueVerse}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="mt-4 text-center text-xs leading-5 text-slate-500">
            Platform features can vary by league type and settings.
            Sleeper supports automated LeagueVerse import. ESPN and Yahoo
            currently use the LeagueVerse spreadsheet migration workflow
            and do not automatically synchronize weekly league activity.
          </p>
        </div>
      </section>

      {/* WHY LEAGUEVERSE */}
      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              The Difference
            </p>

            <h2 className="mt-4 text-4xl font-bold md:text-5xl">
              Your Fantasy App Manages Players.
              <span className="block text-violet-400">
                LeagueVerse Makes You Manage a Franchise.
              </span>
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Adding contracts changes nearly every dynasty decision.
              A player&apos;s value is no longer just about talent.
              Salary, contract length, cap space, guarantees, and future
              flexibility all become part of the equation.
            </p>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-7">
              <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
                Trades
              </p>

              <h3 className="mt-3 text-xl font-bold">
                Value Becomes More Complex
              </h3>

              <p className="mt-4 leading-7 text-slate-400">
                A superstar on an expensive expiring deal becomes a completely
                different asset than that same player on a cheap multi-year contract.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-7">
              <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
                Roster Building
              </p>

              <h3 className="mt-3 text-xl font-bold">
                Cap Space Becomes an Asset
              </h3>

              <p className="mt-4 leading-7 text-slate-400">
                Owners have to balance stars, bargains, rookies, future
                obligations, and financial flexibility.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 p-7">
              <p className="text-sm font-semibold uppercase tracking-wide text-violet-400">
                Offseason
              </p>

              <h3 className="mt-3 text-xl font-bold">
                The League Never Really Stops
              </h3>

              <p className="mt-4 leading-7 text-slate-400">
                Franchise tags, free agency, rookie contracts, and roster
                compliance create meaningful league events between seasons.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* IMPORT OPTIONS */}
      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-5xl px-6 py-20">
          <div className="rounded-3xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
              League Migration
            </p>

            <h2 className="mt-4 text-4xl font-bold">
              Import From More Than One Platform.
            </h2>

            <p className="mx-auto mt-6 max-w-3xl text-lg leading-8 text-slate-400">
              Bring your existing dynasty league into LeagueVerse without
              abandoning the fantasy platform your owners already know.
            </p>

            <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-emerald-800 bg-emerald-950/20 p-5">
                <p className="font-bold text-white">
                  Sleeper
                </p>

                <p className="mt-2 text-sm font-semibold text-emerald-300">
                  One-Click Import
                </p>
              </div>

              <div className="rounded-xl border border-violet-800 bg-violet-950/20 p-5">
                <p className="font-bold text-white">
                  ESPN
                </p>

                <p className="mt-2 text-sm font-semibold text-violet-300">
                  Spreadsheet Import
                </p>
              </div>

              <div className="rounded-xl border border-violet-800 bg-violet-950/20 p-5">
                <p className="font-bold text-white">
                  Yahoo
                </p>

                <p className="mt-2 text-sm font-semibold text-violet-300">
                  Spreadsheet Import
                </p>
              </div>
            </div>

            <p className="mt-6 text-sm text-slate-500">
              Automated ESPN and Yahoo synchronization is planned.
            </p>
          </div>
        </div>
      </section>

      {/* FOUNDING CTA */}
      <section>
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            Founding Commissioner Pass
          </p>

          <h2 className="mt-5 text-5xl font-extrabold">
            Ready to Give Your Dynasty League a Front Office?
          </h2>

          <p className="mx-auto mt-6 max-w-3xl text-xl leading-8 text-slate-400">
            Get every LeagueVerse front-office feature for $19 per
            league for the founding season.
          </p>

          <p className="mx-auto mt-4 max-w-3xl text-lg text-slate-500">
            One payment. One league. Unlimited owners.
          </p>

          <div className="mx-auto mt-6 max-w-2xl rounded-xl border border-slate-800 bg-slate-900 p-4">
            <p className="text-sm font-medium text-slate-300">
              Built specifically for serious dynasty commissioners who
              want contracts, salary caps, and a true front-office experience.
            </p>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-lg bg-violet-700 px-8 py-4 text-lg font-semibold text-white hover:bg-violet-600"
            >
              Start Your League
            </Link>

            <Link
              href="/how-it-works"
              className="rounded-lg border border-slate-700 px-8 py-4 text-lg font-semibold text-slate-300 hover:bg-slate-900"
            >
              See How It Works
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

function ComparisonCell({
  value,
}: {
  value: string;
}) {
  const positive =
    value === "✓";

  const negative =
    value === "—" ||
    value === "✗";

  return (
    <td
      className={`p-5 text-center ${
        positive
          ? "font-semibold text-emerald-300"
          : negative
            ? "text-slate-600"
            : "text-slate-300"
      }`}
    >
      {value}
    </td>
  );
}
import Link from "next/link";

const foundingFeatures = [
  "Unlimited league members",
  "Multi-year contracts",
  "Salary cap management",
  "Guaranteed money",
  "Dead cap tracking",
  "Franchise tags",
  "Contract expirations",
  "Contract-based free agency",
  "AI-powered player decisions",
  "Rookie contracts",
  "Draft pick tracking",
  "Roster compliance",
  "Complete offseason management",
  "Automatic season transitions",
  "Future feature updates",
  "Founding Commissioner badge",
];

const memberFeatures = [
  "Join LeagueVerse leagues",
  "Manage your franchise",
  "View contracts and salary information",
  "Participate in free agency",
  "Track draft capital",
  "Access league activity",
];

const valueCards = [
  {
    title: "One Pizza Night",
    value: "$20+",
  },
  {
    title: "Four Coffees",
    value: "$20+",
  },
  {
    title: "LeagueVerse",
    value: "$19",
  },
];

const benefits = [
  {
    title: "Replace the Spreadsheet",
    description:
      "Stop managing contracts, salary caps, rookie contracts, free agency, and offseason rules with shared spreadsheets.",
  },
  {
    title: "Create Year-Round Engagement",
    description:
      "Keep owners active through contracts, free agency, rookie drafts, cap management, and offseason decisions.",
  },
  {
    title: "Build a Better Dynasty League",
    description:
      "Introduce consequences, scarcity, roster turnover, and long-term planning that traditional keeper leagues can't replicate.",
  },
  {
    title: "Shape the Future",
    description:
      "Founding commissioners will help influence the direction of LeagueVerse as the platform evolves.",
  },
];

export default function PricingPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      {/* HERO */}

      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-400">
            Founding Commissioner Program
          </p>

          <h1 className="mx-auto mt-6 max-w-5xl text-5xl font-extrabold leading-tight md:text-7xl">
            Everything Your League Needs.
            <span className="block text-violet-400">
              One Payment.
            </span>
          </h1>

          <p className="mx-auto mt-8 max-w-4xl text-xl leading-8 text-slate-300">
            No monthly subscription.
            No per-owner pricing.
            No hidden fees.
          </p>

          <p className="mx-auto mt-4 max-w-3xl text-xl leading-8 text-slate-300">
            Just $19 for the entire fantasy season.
          </p>

          <div className="mt-10 inline-block rounded-full border border-violet-800 bg-violet-950/30 px-6 py-3">
            <p className="font-semibold text-violet-300">
              ⚡ Limited Year-One Founding Pricing
            </p>
          </div>
        </div>
      </section>

      {/* PRICING CARDS */}

      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="rounded-3xl border border-slate-800 bg-slate-900 p-8">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-slate-500">
                League Members
              </p>

              <h2 className="mt-4 text-5xl font-bold">
                Free
              </h2>

              <p className="mt-4 text-slate-400">
                Everything owners need to participate in a LeagueVerse league.
              </p>

              <div className="mt-8 space-y-3">
                {memberFeatures.map((feature) => (
                  <p
                    key={feature}
                    className="text-slate-300"
                  >
                    ✓ {feature}
                  </p>
                ))}
              </div>
            </div>

            <div className="relative rounded-3xl border-2 border-violet-700 bg-violet-950/20 p-8">
              <div className="absolute -top-4 left-8 rounded-full bg-violet-700 px-4 py-2 text-xs font-bold uppercase tracking-wide">
                Best Value
              </div>

              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
                Founding Commissioner Pass
              </p>

              <div className="mt-5 flex items-end gap-3">
                <h2 className="text-6xl font-extrabold">
                  $19
                </h2>

                <p className="pb-3 text-slate-400">
                  per season
                </p>
              </div>

              <p className="mt-5 text-lg text-slate-300">
                One payment unlocks the complete LeagueVerse experience for
                your entire league.
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {foundingFeatures.map((feature) => (
                  <p
                    key={feature}
                    className="text-sm text-slate-300"
                  >
                    ✓ {feature}
                  </p>
                ))}
              </div>

              <Link
                href="/signup"
                className="mt-10 inline-block w-full rounded-lg bg-violet-700 px-6 py-4 text-center text-lg font-semibold text-white hover:bg-violet-600"
              >
                Become a Founding Commissioner
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* VALUE COMPARISON */}

      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            Put It In Perspective
          </p>

          <h2 className="mt-4 text-5xl font-bold">
            What Does $19 Actually Buy?
          </h2>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {valueCards.map((card) => (
              <div
                key={card.title}
                className="rounded-2xl border border-slate-800 bg-slate-950 p-8"
              >
                <p className="text-slate-500">
                  {card.title}
                </p>

                <p className="mt-4 text-5xl font-bold">
                  {card.value}
                </p>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-10 max-w-3xl text-xl leading-8 text-slate-300">
            For less than the cost of one night out, your entire league gets
            contracts, salary caps, franchise tags, free agency, rookie
            contracts, and a complete offseason operating system.
          </p>
        </div>
      </section>

      {/* BENEFITS */}

      <section className="border-b border-slate-800">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
              Why LeagueVerse?
            </p>

            <h2 className="mt-4 text-5xl font-bold">
              You're Not Buying Software.
            </h2>

            <p className="mt-4 text-5xl font-bold text-violet-400">
              You're Upgrading Your League.
            </p>
          </div>

          <div className="mt-14 grid gap-6 md:grid-cols-2">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-8"
              >
                <h3 className="text-2xl font-bold">
                  {benefit.title}
                </h3>

                <p className="mt-4 leading-8 text-slate-400">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* COMPANION PLATFORM */}

      <section className="border-b border-slate-800 bg-slate-900/30">
        <div className="mx-auto max-w-5xl px-6 py-20 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-violet-400">
            Keep What Already Works
          </p>

          <h2 className="mt-4 text-5xl font-bold">
            No Platform Migration Required.
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-slate-300">
            Continue using Sleeper, ESPN, or Yahoo for scoring, lineups,
            schedules, and weekly matchups.
          </p>

          <p className="mx-auto mt-4 max-w-3xl text-xl leading-8 text-slate-300">
            LeagueVerse adds the front-office systems those platforms don't
            provide.
          </p>
        </div>
      </section>

      {/* FINAL CTA */}

      <section>
        <div className="mx-auto max-w-4xl px-6 py-24 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.35em] text-violet-400">
            Founding Commissioners Wanted
          </p>

          <h2 className="mt-5 text-6xl font-extrabold leading-tight">
            Build the League Everyone Wishes They Were In.
          </h2>

          <p className="mx-auto mt-8 max-w-3xl text-xl leading-8 text-slate-400">
            Contracts.
            Salary caps.
            Franchise tags.
            Free agency.
            Rookie contracts.
          </p>

          <p className="mx-auto mt-4 max-w-3xl text-xl leading-8 text-slate-400">
            Everything for $19.
          </p>

          <Link
            href="/signup"
            className="mt-10 inline-block rounded-lg bg-violet-700 px-10 py-5 text-xl font-semibold text-white hover:bg-violet-600"
          >
            Become a Founding Commissioner
          </Link>
        </div>
      </section>
    </main>
  );
}
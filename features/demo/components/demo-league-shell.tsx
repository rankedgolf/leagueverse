import Link from "next/link";

type DemoLeagueShellProps = {
  leagueName: string;
  seasonName?: string | null;
  children: React.ReactNode;
};

const navItems = [
  { label: "Overview", href: "" },
  { label: "Teams", href: "teams" },
  { label: "Rosters", href: "rosters" },
  { label: "Standings", href: "standings" },
  { label: "Contracts", href: "contracts" },
  { label: "Salary Cap", href: "salary-cap" },
  { label: "Transactions", href: "transactions" },
  { label: "Draft", href: "draft" },
];

export function DemoLeagueShell({
  leagueName,
  seasonName,
  children,
}: DemoLeagueShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="border-b border-violet-800 bg-violet-950/30">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-3">
          <p className="text-sm text-violet-200">
            <span className="font-bold text-white">
              LeagueVerse Demo
            </span>{" "}
            — Explore a live read-only dynasty league.
          </p>

          <Link
            href="/signup"
            className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-600"
          >
            Start Your League
          </Link>
        </div>
      </div>

      <div className="flex min-h-[calc(100vh-57px)]">
        <aside className="hidden w-72 border-r border-slate-800 bg-slate-900 p-6 lg:block">
          <Link
            href="/"
            className="text-sm font-bold uppercase tracking-wide text-slate-400 hover:text-white"
          >
            LeagueVerse
          </Link>

          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
              Demo League
            </p>

            <h1 className="mt-2 text-2xl font-bold">
              {leagueName}
            </h1>

            <p className="mt-1 text-sm text-slate-400">
              {seasonName || "League Universe"}
            </p>
          </div>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const href = item.href
                ? `/demo/${item.href}`
                : "/demo";

              return (
                <Link
                  key={item.label}
                  href={href}
                  className="block rounded-lg px-3 py-2 text-sm font-medium text-slate-300 hover:bg-slate-800 hover:text-white"
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-10 rounded-xl border border-slate-800 bg-slate-950 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Read-Only Demo
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Explore how LeagueVerse manages contracts, salary caps,
              rosters, draft capital, and year-round dynasty operations.
            </p>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-6 py-8 lg:px-10">
          <div className="mb-6 border-b border-slate-800 pb-5 lg:hidden">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-400">
                  LeagueVerse Demo
                </p>

                <h1 className="mt-1 text-xl font-bold">
                  {leagueName}
                </h1>

                <p className="mt-1 text-xs text-slate-500">
                  {seasonName || "League Universe"}
                </p>
              </div>

              <Link
                href="/"
                className="text-sm font-semibold text-slate-300 hover:text-white"
              >
                Home
              </Link>
            </div>

            <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
              {navItems.map((item) => {
                const href = item.href
                  ? `/demo/${item.href}`
                  : "/demo";

                return (
                  <Link
                    key={item.label}
                    href={href}
                    className="whitespace-nowrap rounded-lg border border-slate-800 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-300"
                  >
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}



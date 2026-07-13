import Link from "next/link";

type LeagueShellProps = {
  leagueId: string;
  leagueName: string;
  seasonName?: string | null;
  children: React.ReactNode;
};

const navItems = [
  { label: "Overview", href: "" },
  { label: "Teams", href: "teams" },
{ label: "Rosters", href: "rosters" }, 
{ label: "Players", href: "players" },
  { label: "Members", href: "members" },
  { label: "Standings", href: "standings" },
  { label: "Contracts", href: "contracts" },
  { label: "Salary Cap", href: "salary-cap" },
  { label: "Transactions", href: "transactions" },
  { label: "Draft", href: "draft" },
  { label: "History", href: "history" },
  { label: "AI News", href: "news" },
  { label: "Settings", href: "settings" },
];

export function LeagueShell({
  leagueId,
  leagueName,
  seasonName,
  children,
}: LeagueShellProps) {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="flex min-h-screen">
        <aside className="hidden w-72 border-r border-slate-800 bg-slate-900 p-6 lg:block">
          <Link href="/dashboard" className="text-sm font-bold uppercase tracking-wide text-slate-400">
            LeagueVerse
          </Link>

          <div className="mt-8">
            <h1 className="text-2xl font-bold">{leagueName}</h1>
            <p className="mt-1 text-sm text-slate-400">
              {seasonName || "League Universe"}
            </p>
          </div>

          <nav className="mt-8 space-y-1">
            {navItems.map((item) => {
              const href = item.href
                ? `/leagues/${leagueId}/${item.href}`
                : `/leagues/${leagueId}`;

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
        </aside>

        <section className="flex-1 px-6 py-8 lg:px-10">
          <div className="mb-6 flex items-center justify-between border-b border-slate-800 pb-4 lg:hidden">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-400">
                LeagueVerse
              </p>
              <h1 className="text-xl font-bold">{leagueName}</h1>
            </div>

            <Link href="/dashboard" className="text-sm text-slate-300">
              Dashboard
            </Link>
          </div>

          {children}
        </section>
      </div>
    </main>
  );
}
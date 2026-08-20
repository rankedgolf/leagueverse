import Link from "next/link";

const navItems = [
  {
    href: "/",
    label: "Home",
  },
  {
    href: "/features",
    label: "Features",
  },
  {
    href: "/how-it-works",
    label: "How It Works",
  },
  {
    href: "/comparison",
    label: "Compare",
  },
  {
    href: "/blog",
    label: "Blog",
  },
  {
    href: "/pricing",
    label: "Pricing",
  },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="text-xl font-extrabold tracking-tight text-white"
        >
          League
          <span className="text-violet-400">
            Verse
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-sm font-medium text-slate-300 transition hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden rounded-lg px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-900 hover:text-white sm:inline-block"
          >
            Log In
          </Link>

          <Link
            href="/signup"
            className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-violet-600"
          >
            Start Your League
          </Link>
        </div>
      </div>

      <div className="border-t border-slate-800 lg:hidden">
        <nav className="mx-auto flex max-w-7xl gap-5 overflow-x-auto px-6 py-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="whitespace-nowrap text-sm font-medium text-slate-400 hover:text-white"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
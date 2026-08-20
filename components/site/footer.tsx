import Link from "next/link";

const productLinks = [
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
    href: "/pricing",
    label: "Pricing",
  },
  {
    href: "/blog",
    label: "Blog",
  },
];

const companyLinks = [
  {
    href: "/privacy",
    label: "Privacy Policy",
  },
  {
    href: "/terms",
    label: "Terms of Service",
  },
];

export function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950">
      <div className="mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-12 md:grid-cols-4">
          <div>
            <Link
              href="/"
              className="text-2xl font-extrabold text-white"
            >
              League
              <span className="text-violet-400">
                Verse
              </span>
            </Link>

            <p className="mt-5 leading-7 text-slate-400">
              The future of dynasty fantasy sports.
            </p>

            <p className="mt-3 leading-7 text-slate-500">
              Turn your fantasy league into a true front-office
              experience with contracts, salary caps, franchise tags,
              free agency, and year-round league management.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Product
            </h3>

            <ul className="mt-5 space-y-3">
              {productLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Platform
            </h3>

            <div className="mt-5 space-y-4">
              <div className="rounded-lg border border-emerald-800 bg-emerald-950/20 p-3">
                <p className="font-semibold text-emerald-300">
                  ✓ Sleeper Integration
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Available now
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                <p className="font-semibold text-slate-300">
                  ESPN
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Coming soon
                </p>
              </div>

              <div className="rounded-lg border border-slate-800 bg-slate-900 p-3">
                <p className="font-semibold text-slate-300">
                  Yahoo
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  Coming soon
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">
              Legal
            </h3>

            <ul className="mt-5 space-y-3">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-slate-400 transition hover:text-white"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="mt-8 rounded-lg border border-violet-800 bg-violet-950/20 p-4">
              <p className="text-sm font-semibold text-violet-300">
                Founding Season
              </p>

              <p className="mt-2 text-3xl font-extrabold text-white">
                $19
              </p>

              <p className="mt-1 text-sm text-slate-400">
                One league.
                <br />
                Unlimited owners.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-16 flex flex-col items-center justify-between gap-4 border-t border-slate-800 pt-8 text-center text-sm text-slate-500 md:flex-row">
          <p>
            © 2026 LeagueVerse. All rights reserved.
          </p>

          <p>
            Built for dynasty commissioners.
          </p>
        </div>
      </div>
    </footer>
  );
}
import Link from "next/link";

type PremiumFeatureLockedProps = {
  leagueId: string;
};

export function PremiumFeatureLocked({
  leagueId,
}: PremiumFeatureLockedProps) {
  return (
    <div className="mx-auto max-w-3xl py-12">
      <div className="rounded-3xl border border-violet-800 bg-violet-950/20 p-10 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
          LeagueVerse Premium
        </p>

        <h1 className="mt-4 text-4xl font-bold text-white">
          🔒 Activate Your League
        </h1>

        <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-400">
          This feature requires an active LeagueVerse Founding Commissioner Pass.
        </p>

        <p className="mt-3 text-slate-500">
          Unlock contracts, salary caps, free agency, rookie contracts,
          franchise tags, and offseason operations for $19 for the season.
        </p>

        <Link
          href={`/leagues/${leagueId}`}
          className="mt-8 inline-block rounded-lg bg-violet-700 px-6 py-3 font-semibold text-white hover:bg-violet-600"
        >
          Activate League • $19
        </Link>
      </div>
    </div>
  );
}
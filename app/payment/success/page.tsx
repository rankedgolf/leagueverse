import Link from "next/link";

type SuccessPageProps = {
  searchParams: Promise<{
    session_id?: string;
  }>;
};

export default async function PaymentSuccessPage({
  searchParams,
}: SuccessPageProps) {
  const { session_id } =
    await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-2xl rounded-3xl border border-emerald-800 bg-slate-900 p-10 text-center">
        <div className="text-6xl">
          🎉
        </div>

        <h1 className="mt-6 text-4xl font-bold">
          League Activated!
        </h1>

        <p className="mt-4 text-lg text-slate-400">
          Your Founding Commissioner Pass has been activated.
        </p>

        <p className="mt-2 text-slate-500">
          Contracts, salary caps, free agency,
          franchise tags, and offseason tools
          are now unlocked.
        </p>

        {session_id ? (
          <p className="mt-6 text-xs text-slate-600">
            Session: {session_id}
          </p>
        ) : null}

        <Link
          href="/dashboard"
          className="mt-8 inline-block rounded-lg bg-violet-700 px-6 py-3 font-semibold text-white hover:bg-violet-600"
        >
          Return to Dashboard
        </Link>
      </div>
    </main>
  );
}
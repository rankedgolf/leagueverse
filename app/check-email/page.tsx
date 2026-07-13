import Link from "next/link";

export default function CheckEmailPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-6 text-white">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <h1 className="text-3xl font-bold">Check your email</h1>
        <p className="mt-3 text-slate-400">
          We sent you a confirmation link. After confirming your email, come back and log in to accept your LeagueVerse invitation.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-block rounded-lg bg-white px-5 py-3 font-semibold text-slate-950"
        >
          Go to Login
        </Link>
      </div>
    </main>
  );
}
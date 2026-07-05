import Link from "next/link";
import { login } from "@/features/auth/actions/auth-actions";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">Log in</h1>
        <p className="mt-2 text-slate-600">
          Continue managing your LeagueVerse.
        </p>

        <form action={login} className="mt-8 space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-lg border px-4 py-3"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            required
            className="w-full rounded-lg border px-4 py-3"
          />

          <button
            type="submit"
            className="w-full rounded-lg bg-slate-900 px-4 py-3 font-semibold text-white hover:bg-slate-800"
          >
            Log In
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Need an account?{" "}
          <Link href="/signup" className="font-semibold text-slate-900">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  );
}
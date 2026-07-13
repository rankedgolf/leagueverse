import Link from "next/link";
import { signUp } from "@/features/auth/actions/auth-actions";

type SignupPageProps = {
  searchParams: Promise<{
    invite?: string;
  }>;
};

export default async function SignupPage({
  searchParams,
}: SignupPageProps) {
  const { invite } = await searchParams;

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-slate-900">
          Create your account
        </h1>

        <p className="mt-2 text-slate-600">
          Start building your fantasy league universe.
        </p>

        <form action={signUp} className="mt-8 space-y-4">
          {invite && (
            <input
              type="hidden"
              name="invite"
              value={invite}
            />
          )}

          <input
            name="display_name"
            placeholder="Display name"
            required
            className="w-full rounded-lg border px-4 py-3"
          />

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
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600">
          Already have an account?{" "}
          <Link
            href={invite ? `/login?invite=${invite}` : "/login"}
            className="font-semibold text-slate-900"
          >
            Log in
          </Link>
        </p>
      </div>
    </main>
  );
}
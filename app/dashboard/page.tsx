import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { logout } from "@/features/auth/actions/auth-actions";

export default async function DashboardPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name,email")
    .eq("id", user.id)
    .single();

  const { data: memberships } = await supabase
    .from("league_members")
    .select(
      `
      role,
      leagues (
        id,
        name,
        slug,
        created_at
      )
    `
    )
    .eq("user_id", user.id)
    .eq("status", "active");

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm uppercase tracking-wide text-slate-400">
              LeagueVerse Dashboard
            </p>
            <h1 className="mt-2 text-4xl font-bold">
              Welcome, {profile?.display_name || user.email}
            </h1>
          </div>

          <form action={logout}>
            <button className="rounded-lg bg-white px-4 py-2 font-semibold text-slate-900">
              Log out
            </button>
          </form>
        </div>

        <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Your leagues</h2>
              <p className="mt-2 text-slate-400">
                Manage your fantasy league universes.
              </p>
            </div>

            <Link
              href="/leagues/new"
              className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-950"
            >
              Create League
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            {memberships && memberships.length > 0 ? (
              memberships.map((membership: any) => {
                const league = Array.isArray(membership.leagues)
                  ? membership.leagues[0]
                  : membership.leagues;

                if (!league) return null;

                return (
                  <Link
                    key={league.id}
                    href={`/leagues/${league.id}`}
                    className="block rounded-xl border border-slate-800 bg-slate-950 p-5 hover:border-slate-600"
                  >
                    <p className="text-xl font-bold">{league.name}</p>
                    <p className="mt-1 text-sm text-slate-400">
                      Role: {membership.role}
                    </p>
                  </Link>
                );
              })
            ) : (
              <p className="text-slate-400">
                You do not have any leagues yet. Create one to get started.
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
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
          <h2 className="text-2xl font-bold">Your leagues</h2>
         <a
  href="/leagues/new"
  className="mt-6 inline-block rounded-lg bg-white px-4 py-3 font-semibold text-slate-950"
>
  Create League
</a>
        </div>
      </div>
    </main>
  );
}
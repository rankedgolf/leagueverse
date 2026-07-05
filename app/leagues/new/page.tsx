import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createLeague } from "@/features/leagues/actions/create-league";

export default async function NewLeaguePage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: sports } = await supabase
    .from("sports")
    .select("key,name")
    .order("name");

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-10 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm uppercase tracking-wide text-slate-400">
          LeagueVerse
        </p>

        <h1 className="mt-2 text-4xl font-bold">Create a League</h1>

        <p className="mt-3 text-slate-400">
          Start building your fantasy league universe.
        </p>

        <form
          action={createLeague}
          className="mt-8 space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-8"
        >
          <div>
            <label className="block text-sm font-medium text-slate-300">
              League Name
            </label>
            <input
              name="name"
              required
              placeholder="Dynasty Legends"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300">
              Sport
            </label>
            <select
              name="sport"
              required
              defaultValue="football"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            >
              {sports?.map((sport) => (
                <option key={sport.key} value={sport.key}>
                  {sport.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-slate-950 hover:bg-slate-200"
          >
            Create League
          </button>
        </form>
      </div>
    </main>
  );
}
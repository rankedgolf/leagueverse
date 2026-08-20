import { createLeague } from "@/features/leagues/actions/create-league";

export default function NewLeaguePage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-white">
      <div className="mx-auto max-w-2xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-violet-400">
          Create League
        </p>

        <h1 className="mt-3 text-4xl font-bold">
          Start Your LeagueVerse League
        </h1>

        <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">
          Create your league, then import an existing dynasty league or
          build your front office from scratch.
        </p>

        <form
          action={createLeague}
          className="mt-8 space-y-6 rounded-2xl border border-slate-800 bg-slate-900 p-8"
        >
          <div>
            <label
              htmlFor="name"
              className="text-sm font-semibold text-white"
            >
              League Name
            </label>

            <input
              id="name"
              name="name"
              required
              placeholder="LeagueVerse Demo League"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white placeholder:text-slate-600"
            />
          </div>

          <div>
            <label
              htmlFor="sport"
              className="text-sm font-semibold text-white"
            >
              Sport
            </label>

            <select
              id="sport"
              name="sport"
              required
              defaultValue="football"
              className="mt-2 w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            >
              <option value="football">
                Football
              </option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-violet-700 px-5 py-3 font-semibold text-white hover:bg-violet-600"
          >
            Create League
          </button>
        </form>
      </div>
    </main>
  );
}
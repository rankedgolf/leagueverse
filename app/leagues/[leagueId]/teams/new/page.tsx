import { createTeam } from "@/features/teams/actions/create-team";

type NewTeamPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function NewTeamPage({ params }: NewTeamPageProps) {
  const { leagueId } = await params;

  async function createTeamForLeague(formData: FormData) {
    "use server";
    await createTeam(leagueId, formData);
  }

  return (
    <div className="mx-auto max-w-2xl">
      <p className="text-sm uppercase tracking-wide text-slate-400">Teams</p>
      <h1 className="mt-2 text-4xl font-bold">Add Team</h1>

      <form
        action={createTeamForLeague}
        className="mt-8 space-y-5 rounded-2xl border border-slate-800 bg-slate-900 p-8"
      >
        <input
          name="name"
          required
          placeholder="Springfield Sharks"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
        />

        <input
          name="nickname"
          placeholder="Sharks"
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
        />

        <input
          name="abbreviation"
          placeholder="SHK"
          maxLength={5}
          className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
        />

        <button className="w-full rounded-lg bg-white px-4 py-3 font-semibold text-slate-950">
          Create Team
        </button>
      </form>
    </div>
  );
}
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { assignTeamOwner } from "@/features/teams/actions/assign-owner";

type TeamPageProps = {
  params: Promise<{
    leagueId: string;
    teamId: string;
  }>;
};

export default async function TeamPage({ params }: TeamPageProps) {
  const { leagueId, teamId } = await params;

  const supabase = await createClient();

 const { data: team, error: teamError } = await supabase
    .from("teams")
    .select(
      "id,name,nickname,abbreviation,owner_member_id"
    )
    .eq("id", teamId)
    .eq("league_id", leagueId)
    .single();

    if (teamError) {
  return (
    <div className="mx-auto max-w-4xl">
      <h1 className="text-3xl font-bold text-red-400">Team Error</h1>
      <p className="mt-4">{teamError.message}</p>
    </div>
  );
}

  if (!team) {
    notFound();
  }

  const { data: members } = await supabase
    .from("league_members")
    .select(
      `
      id,
      role,
      profiles (
        display_name,
        email
      )
    `
    )
    .eq("league_id", leagueId)
    .eq("status", "active")
    .in("role", ["team_owner", "commissioner", "co_commissioner"])
    .order("created_at");

  async function assignOwner(formData: FormData) {
    "use server";
    await assignTeamOwner(leagueId, teamId, formData);
  }

  const currentOwner = members?.find(
    (member) => member.id === team.owner_member_id
  );

  const ownerProfile = Array.isArray(currentOwner?.profiles)
    ? currentOwner?.profiles[0]
    : currentOwner?.profiles;

  return (
    <div className="mx-auto max-w-6xl">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">
          Franchise HQ
        </p>
        <h1 className="mt-2 text-4xl font-bold">{team.name}</h1>
        <p className="mt-3 text-slate-400">
          {team.nickname || "No nickname"} ·{" "}
          {team.abbreviation || "No abbreviation"}
        </p>
      </div>

      <section className="mt-8 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 md:col-span-2">
          <p className="text-sm text-slate-400">Owner</p>
          <p className="mt-2 text-2xl font-bold">
            {ownerProfile?.display_name ||
              ownerProfile?.email ||
              "Unassigned"}
          </p>

          <form action={assignOwner} className="mt-5 flex gap-3">
            <select
              name="owner_member_id"
              defaultValue={team.owner_member_id || ""}
              className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white"
            >
              <option value="">Unassigned</option>
              {members?.map((member) => {
                const profile = Array.isArray(member.profiles)
                  ? member.profiles[0]
                  : member.profiles;

                return (
                  <option key={member.id} value={member.id}>
                    {profile?.display_name ||
                      profile?.email ||
                      "Unnamed Member"}{" "}
                    ({member.role})
                  </option>
                );
              })}
            </select>

            <button className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-950">
              Save
            </button>
          </form>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Roster</p>
          <p className="mt-2 text-2xl font-bold">0 Players</p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <p className="text-sm text-slate-400">Status</p>
<p className="mt-2 text-2xl font-bold">Active</p>
        </div>
      </section>
    </div>
  );
}

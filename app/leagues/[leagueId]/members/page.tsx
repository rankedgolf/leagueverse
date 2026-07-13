import { MemberService } from "@/features/members/services/member-service";
import { InvitationService } from "@/features/invitations/services/invitation-service";
import { createInvitation } from "@/features/invitations/actions/create-invitation";

type MembersPageProps = {
  params: Promise<{
    leagueId: string;
  }>;
};

export default async function MembersPage({ params }: MembersPageProps) {
  const { leagueId } = await params;

  const members = await MemberService.getLeagueMembers(leagueId);
  const invitations = await InvitationService.getLeagueInvitations(leagueId);

  async function createInvitationForLeague(formData: FormData) {
    "use server";
    await createInvitation(leagueId, formData);
  }

  return (
    <div className="mx-auto max-w-5xl space-y-8">
      <div>
        <p className="text-sm uppercase tracking-wide text-slate-400">
          Members
        </p>
        <h1 className="mt-2 text-4xl font-bold">League Members</h1>
        <p className="mt-3 text-slate-400">
          Invite managers and manage league access.
        </p>
      </div>

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="text-xl font-bold">Invite Member</h2>

        <form action={createInvitationForLeague} className="mt-5 grid gap-4 md:grid-cols-3">
          <input
            name="email"
            type="email"
            required
            placeholder="manager@email.com"
            className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white md:col-span-2"
          />

          <select name="role" defaultValue="team_owner">
  <option value="team_owner">Team Owner</option>
  <option value="co_commissioner">Co-Commissioner</option>
  <option value="viewer">Viewer</option>
</select>

          <button className="rounded-lg bg-white px-4 py-3 font-semibold text-slate-950 md:col-span-3">
            Create Invite
          </button>
        </form>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Active Members</h2>

        <div className="mt-4 space-y-3">
          {members.map((member) => (
          <div
  key={member.id}
  className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
>
  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
    <div>
      <p className="text-xl font-bold">
        {member.user.displayName || member.user.email || "Unnamed User"}
      </p>
      <p className="mt-1 text-sm text-slate-400">
        {member.role} · {member.status}
      </p>
    </div>

    <div className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        Team
      </p>
      <p className="font-semibold">
        {member.team
          ? `${member.team.name} (${member.team.abbreviation || "TEAM"})`
          : "No team assigned"}
      </p>
    </div>
  </div>
</div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Pending Invitations</h2>

        <div className="mt-4 space-y-3">
          {invitations.length > 0 ? (
            invitations.map((invite) => (
              <div
                key={invite.id}
                className="rounded-2xl border border-slate-800 bg-slate-900 p-5"
              >
                <p className="text-xl font-bold">{invite.email}</p>
                <p className="mt-1 text-sm text-slate-400">
                  {invite.role} · {invite.status}
                </p>
                <p className="mt-3 break-all text-sm text-slate-300">
                  Invite link: /invite/{invite.token}
                </p>
              </div>
            ))
          ) : (
            <p className="text-slate-400">No invitations yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
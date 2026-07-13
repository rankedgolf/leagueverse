import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvitationService } from "@/features/invitations/services/invitation-service";
import { acceptInvitation } from "@/features/invitations/actions/accept-invitation";

type InvitePageProps = {
  params: Promise<{
    token: string;
  }>;
};

export default async function InvitePage({ params }: InvitePageProps) {
  const { token } = await params;

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const invitation = await InvitationService.getInvitation(token);

  if (!invitation) {
    notFound();
  }

  const league = Array.isArray(invitation.leagues)
    ? invitation.leagues[0]
    : invitation.leagues;

  async function accept() {
    "use server";
    await acceptInvitation(token);
  }

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-white">
      <div className="mx-auto max-w-xl rounded-2xl border border-slate-800 bg-slate-900 p-8">
        <p className="text-sm uppercase tracking-wide text-slate-400">
          League Invitation
        </p>

        <h1 className="mt-3 text-4xl font-bold">You're Invited!</h1>

        <p className="mt-6 text-slate-400">You've been invited to join:</p>

        <h2 className="mt-2 text-3xl font-bold">{league?.name}</h2>

        <div className="mt-8 rounded-xl border border-slate-800 bg-slate-950 p-5">
          <div className="flex justify-between">
            <span className="text-slate-400">Email</span>
            <span>{invitation.email}</span>
          </div>

          <div className="mt-3 flex justify-between">
            <span className="text-slate-400">Role</span>
            <span>{invitation.role}</span>
          </div>

          <div className="mt-3 flex justify-between">
            <span className="text-slate-400">Status</span>
            <span>{invitation.status}</span>
          </div>
        </div>

        <div className="mt-8">
          {user ? (
            <form action={accept}>
              <button className="rounded-lg bg-white px-6 py-3 font-semibold text-slate-950">
                Accept Invitation
              </button>
            </form>
          ) : (
            <div className="flex gap-4">
              <Link
                href={`/login?invite=${token}`}
                className="rounded-lg bg-white px-5 py-3 font-semibold text-slate-950"
              >
                Login
              </Link>

              <Link
                href={`/signup?invite=${token}`}
                className="rounded-lg border border-slate-700 px-5 py-3"
              >
                Create Account
              </Link>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

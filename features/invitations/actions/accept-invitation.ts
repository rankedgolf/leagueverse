"use server";

import { notFound, redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

import { InvitationService } from "../services/invitation-service";

export async function acceptInvitation(token: string) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?invite=${token}`);
  }

  const invitation =
    await InvitationService.getInvitation(token);

  if (!invitation) {
    notFound();
  }

  if (invitation.status === "accepted") {
    redirect(
      `/leagues/${invitation.league_id}`,
    );
  }

  const authenticatedEmail =
    user.email?.trim().toLowerCase();

  const invitedEmail =
    invitation.email
      .trim()
      .toLowerCase();

  if (
    !authenticatedEmail ||
    authenticatedEmail !== invitedEmail
  ) {
    throw new Error(
      `This invitation was sent to ${invitation.email}. Please sign in with that email address to accept it.`,
    );
  }

  await InvitationService.acceptInvitation({
    invitationId:
      invitation.id,
    leagueId:
      invitation.league_id,
    userId:
      user.id,
    role:
      invitation.role,
  });

  redirect(
    `/leagues/${invitation.league_id}`,
  );
}
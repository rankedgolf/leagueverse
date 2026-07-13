"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InvitationService } from "../services/invitation-service";
import { validateCreateInvitationInput } from "../validation/create-invitation";

export async function createInvitation(leagueId: string, formData: FormData) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const { data: membership } = await supabase
    .from("league_members")
    .select("role")
    .eq("league_id", leagueId)
    .eq("user_id", user.id)
    .single();

  if (
    !membership ||
    !["owner", "commissioner", "co_commissioner"].includes(membership.role)
  ) {
    throw new Error("You do not have permission to invite members.");
  }

  const { email, role } = validateCreateInvitationInput(formData);

  await InvitationService.createInvitation({
    leagueId,
    email,
    role,
    invitedBy: user.id,
  });

  redirect(`/leagues/${leagueId}/members`);
}
"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateUpdateTeamInput } from "@/features/teams/validation/update-team";

export async function updateTeam(
  leagueId: string,
  teamId: string,
  formData: FormData
) {
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
    throw new Error("You do not have permission to update teams.");
  }

  const values = validateUpdateTeamInput(formData);

  const { error } = await supabase
    .from("teams")
    .update(values)
    .eq("id", teamId)
    .eq("league_id", leagueId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/leagues/${leagueId}/teams/${teamId}`);
}
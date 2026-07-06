"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateCreateTeamInput } from "@/features/teams/validation/create-team";

export async function createTeam(leagueId: string, formData: FormData) {
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
    throw new Error("You do not have permission to create teams.");
  }

  const { name, nickname, abbreviation } = validateCreateTeamInput(formData);

  const { error } = await supabase.from("teams").insert({
    league_id: leagueId,
    name,
    nickname,
    abbreviation,
  });

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/leagues/${leagueId}/teams`);
}
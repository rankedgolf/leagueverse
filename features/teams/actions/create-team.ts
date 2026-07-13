"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateCreateTeamInput } from "@/features/teams/validation/create-team";
import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

export async function createTeam(leagueId: string, formData: FormData) {
  await AuthorizationService.requirePermission({
    leagueId,
    permission: Permissions.ManageLeague,
  });

  const supabase = await createClient();

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
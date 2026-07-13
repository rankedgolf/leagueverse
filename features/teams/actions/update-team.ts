"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { validateUpdateTeamInput } from "@/features/teams/validation/update-team";
import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

export async function updateTeam(
  leagueId: string,
  teamId: string,
  formData: FormData
) {
  await AuthorizationService.requirePermission({
    leagueId,
    permission: Permissions.ManageLeague,
  });

  const supabase = await createClient();

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
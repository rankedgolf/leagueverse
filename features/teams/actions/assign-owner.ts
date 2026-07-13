"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

export async function assignTeamOwner(
  leagueId: string,
  teamId: string,
  formData: FormData
) {
  await AuthorizationService.requirePermission({
    leagueId,
    permission: Permissions.ManageMembers,
  });

  const supabase = await createClient();

  const ownerMemberId = String(formData.get("owner_member_id") || "");

  const { error } = await supabase
    .from("teams")
    .update({
      owner_member_id: ownerMemberId || null,
    })
    .eq("id", teamId)
    .eq("league_id", leagueId);

  if (error) {
    throw new Error(error.message);
  }

  redirect(`/leagues/${leagueId}/teams/${teamId}`);
}
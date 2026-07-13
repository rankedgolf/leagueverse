"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

type RemovePlayerFromRosterInput = {
  leagueId: string;
  rosterId: string;
};

export async function removePlayerFromRoster(
  input: RemovePlayerFromRosterInput
) {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageRosters,
  });

  const supabase = await createClient();

  const { data: roster, error: rosterLookupError } = await supabase
    .from("team_rosters")
    .select("id, player_id")
    .eq("id", input.rosterId)
    .eq("league_id", input.leagueId)
    .maybeSingle();

  if (rosterLookupError) {
    throw new Error(rosterLookupError.message);
  }

  if (!roster) {
    throw new Error("Roster entry not found.");
  }

  const { error: deleteError } = await supabase
    .from("team_rosters")
    .delete()
    .eq("id", input.rosterId)
    .eq("league_id", input.leagueId);

  if (deleteError) {
    throw new Error(deleteError.message);
  }

  const { error: leaguePlayerError } = await supabase
    .from("league_players")
    .update({
      status: "free_agent",
      current_team_id: null,
      updated_at: new Date().toISOString(),
    })
    .eq("league_id", input.leagueId)
    .eq("player_id", roster.player_id);

  if (leaguePlayerError) {
    throw new Error(leaguePlayerError.message);
  }

  revalidatePath(`/leagues/${input.leagueId}/rosters`);
  revalidatePath(`/leagues/${input.leagueId}/players`);
}
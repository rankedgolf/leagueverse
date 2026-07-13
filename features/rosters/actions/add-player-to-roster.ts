"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

type AddPlayerToRosterInput = {
  leagueId: string;
  seasonId: string;
  teamId: string;
  playerId: string;
  rosterSlot?: string;
};

export async function addPlayerToRoster(input: AddPlayerToRosterInput) {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageRosters,
  });

  const supabase = await createClient();

  const { error: leaguePlayerError } = await supabase
    .from("league_players")
    .upsert(
      {
        league_id: input.leagueId,
        player_id: input.playerId,
        status: "rostered",
        current_team_id: input.teamId,
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "league_id,player_id",
      }
    );

  if (leaguePlayerError) {
    throw new Error(leaguePlayerError.message);
  }

  const { error: rosterError } = await supabase
    .from("team_rosters")
    .insert({
      league_id: input.leagueId,
      season_id: input.seasonId,
      team_id: input.teamId,
      player_id: input.playerId,
      roster_slot: input.rosterSlot ?? "active",
      acquired_type: "manual",
      acquired_at: new Date().toISOString(),
    });

  if (rosterError) {
    throw new Error(rosterError.message);
  }

  revalidatePath(`/leagues/${input.leagueId}/rosters`);
  revalidatePath(`/leagues/${input.leagueId}/players`);
}
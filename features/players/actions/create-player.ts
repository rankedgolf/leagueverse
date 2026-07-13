"use server";

import { createClient } from "@/lib/supabase/server";
import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";

type CreatePlayerInput = {
    leagueId: string;
  firstName: string;
  lastName: string;
  displayName: string;
  position: string;
  proTeam?: string | null;
  sport?: string;
};

export async function createPlayer(input: CreatePlayerInput) {
    await AuthorizationService.requirePermission({
  leagueId: input.leagueId,
  permission: Permissions.ManagePlayers,
});

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("players")
    .insert({
      first_name: input.firstName,
      last_name: input.lastName,
      full_name: input.displayName,
      display_name: input.displayName,
      position: input.position,
      pro_team: input.proTeam,
      sport: input.sport ?? "football",
    })
    .select("id")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
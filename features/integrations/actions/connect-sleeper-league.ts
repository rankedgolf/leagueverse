"use server";

import { revalidatePath } from "next/cache";

import { AuthorizationService } from "@/features/authorization/services/authorization-service";
import { Permissions } from "@/features/authorization/dto/permissions";
import { IntegrationService } from "@/features/integrations/services/integration-service";

type ConnectSleeperLeagueInput = {
  leagueId: string;
  leagueUrlOrId: string;
};

export type ConnectSleeperLeagueResult = {
  success: boolean;
  message: string;
  externalLeagueId?: string;
  leagueName?: string;
};

export async function connectSleeperLeague(
  input: ConnectSleeperLeagueInput
): Promise<ConnectSleeperLeagueResult> {
  await AuthorizationService.requirePermission({
    leagueId: input.leagueId,
    permission: Permissions.ManageLeague,
  });

  const leagueUrlOrId =
    input.leagueUrlOrId.trim();

  if (!leagueUrlOrId) {
    throw new Error(
      "Sleeper league URL or ID is required."
    );
  }

  const { integration, preview } =
    await IntegrationService.connectSleeperLeague({
      leagueId: input.leagueId,
      leagueUrlOrId,
    });

  revalidatePath(
    `/leagues/${input.leagueId}/integrations`
  );

  return {
    success: true,
    message: `${preview.leagueName} is now connected to LeagueVerse.`,
    externalLeagueId:
      integration.externalLeagueId,
    leagueName: preview.leagueName,
  };
}
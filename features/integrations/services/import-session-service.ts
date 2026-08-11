import { createClient } from "@/lib/supabase/server";

import { IntegrationService } from "@/features/integrations/services/integration-service";
import {
  ImportSessionRepository,
  type ContractYearAssignments,
  type ImportSessionDTO,
} from "@/features/integrations/repositories/import-session-repository";

type StartSleeperImportSessionInput = {
  leagueId: string;
};

function buildDefaultAssignments(
  playerIds: string[],
  defaultContractYears: number
): ContractYearAssignments {
  return Object.fromEntries(
    playerIds.map((playerId) => [
      playerId,
      defaultContractYears,
    ])
  );
}

export const ImportSessionService = {
  async startOrResumeSleeperSession(
    input: StartSleeperImportSessionInput
  ): Promise<ImportSessionDTO> {
    const existingSession =
      await ImportSessionRepository.getActiveByLeagueAndProvider(
        input.leagueId,
        "sleeper"
      );

    if (existingSession) {
      return existingSession;
    }

    const integration =
      await IntegrationService.getLeagueIntegration(
        input.leagueId,
        "sleeper"
      );

    if (!integration || !integration.isConnected) {
      throw new Error(
        "This league is not connected to Sleeper."
      );
    }

    const preview =
      await IntegrationService.previewSleeperImport({
        externalLeagueId:
          integration.externalLeagueId,
        externalDraftId:
          integration.externalDraftId,
        defaultContractYears: 1,
      });

    const assignments = buildDefaultAssignments(
      preview.players.map(
        (player) => player.sleeperPlayerId
      ),
      1
    );

    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error(
        "You must be signed in to start an import."
      );
    }

    return ImportSessionRepository.create({
      leagueId: input.leagueId,
      integrationId: integration.id,
      provider: "sleeper",
      externalLeagueId:
        integration.externalLeagueId,
      externalDraftId:
        integration.externalDraftId,
      defaultContractYears: 1,
      previewData: preview,
      contractYearAssignments: assignments,
      createdBy: user.id,
    });
  },

  async updateContractAssignments(params: {
    leagueId: string;
    sessionId: string;
    assignments: ContractYearAssignments;
    currentStep?: number;
  }): Promise<ImportSessionDTO> {
    const session =
      await ImportSessionRepository.getById({
        sessionId: params.sessionId,
        leagueId: params.leagueId,
      });

    if (!session) {
      throw new Error(
        "The import session could not be found."
      );
    }

    if (
      session.status === "completed" ||
      session.status === "cancelled"
    ) {
      throw new Error(
        "This import session can no longer be edited."
      );
    }

    const preview = session.previewData;

    if (!preview) {
      throw new Error(
        "The import preview is missing from this session."
      );
    }

    const validPlayerIds = new Set(
      preview.players.map(
        (player) => player.sleeperPlayerId
      )
    );

    const sanitizedAssignments: ContractYearAssignments =
      {};

    for (const [
      playerId,
      years,
    ] of Object.entries(params.assignments)) {
      if (!validPlayerIds.has(playerId)) {
        continue;
      }

      if (
        !Number.isInteger(years) ||
        years < 1
      ) {
        throw new Error(
          `Invalid contract length for player ${playerId}.`
        );
      }

      sanitizedAssignments[playerId] = years;
    }

    for (const playerId of validPlayerIds) {
      if (
        sanitizedAssignments[playerId] === undefined
      ) {
        sanitizedAssignments[playerId] =
          session.defaultContractYears;
      }
    }

    return ImportSessionRepository.update({
      sessionId: params.sessionId,
      leagueId: params.leagueId,
      contractYearAssignments:
        sanitizedAssignments,
      currentStep: params.currentStep,
    });
  },
};
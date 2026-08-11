import type {
  ConnectLeagueIntegrationInput,
  LeagueIntegrationDTO,
} from "@/features/integrations/dto/integration-dto";
import type { SleeperImportPreviewDTO } from "@/features/integrations/dto/sleeper-import-preview-dto";

import { IntegrationRepository } from "@/features/integrations/repositories/integration-repository";
import { SleeperImportPreviewService } from "@/features/integrations/services/sleeper-import-preview-service";
import {
  SleeperIntegrationService,
  type SleeperLeaguePreviewDTO,
} from "@/features/integrations/services/sleeper-integration-service";

export type IntegrationProvider =
  | "sleeper"
  | "yahoo"
  | "espn";

export const IntegrationService = {
  async previewLeague(
    provider: IntegrationProvider,
    leagueUrlOrId: string
  ): Promise<SleeperLeaguePreviewDTO> {
    switch (provider) {
      case "sleeper":
        return SleeperIntegrationService.previewLeague(
          leagueUrlOrId
        );

      case "yahoo":
        throw new Error(
          "Yahoo integration is not available yet."
        );

      case "espn":
        throw new Error(
          "ESPN integration is not available yet."
        );

      default: {
        const exhaustiveCheck: never = provider;

        throw new Error(
          `Unsupported integration provider: ${exhaustiveCheck}`
        );
      }
    }
  },

  async previewSleeperImport(params: {
    externalLeagueId: string;
    externalDraftId?: string | null;
    defaultContractYears?: number;
  }): Promise<SleeperImportPreviewDTO> {
    return SleeperImportPreviewService.build({
      externalLeagueId: params.externalLeagueId,
      externalDraftId: params.externalDraftId,
      defaultContractYears:
        params.defaultContractYears ?? 1,
    });
  },

  async connectSleeperLeague(params: {
    leagueId: string;
    leagueUrlOrId: string;
  }): Promise<{
    integration: LeagueIntegrationDTO;
    preview: SleeperLeaguePreviewDTO;
  }> {
    const preview =
      await SleeperIntegrationService.previewLeague(
        params.leagueUrlOrId
      );

    const input: ConnectLeagueIntegrationInput = {
      leagueId: params.leagueId,
      provider: "sleeper",
      externalLeagueId: preview.externalLeagueId,
      externalDraftId: preview.latestDraftId,
    };

    const integration =
      await IntegrationRepository.connect(input);

    return {
      integration,
      preview,
    };
  },

  async getLeagueIntegrations(
    leagueId: string
  ): Promise<LeagueIntegrationDTO[]> {
    return IntegrationRepository.getByLeague(
      leagueId
    );
  },

  async getLeagueIntegration(
    leagueId: string,
    provider: IntegrationProvider
  ): Promise<LeagueIntegrationDTO | null> {
    return IntegrationRepository.getByLeagueAndProvider(
      leagueId,
      provider
    );
  },
};
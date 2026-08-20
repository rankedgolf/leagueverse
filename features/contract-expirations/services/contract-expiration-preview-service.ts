import type {
  ContractExpirationPlayerDTO,
  ContractExpirationPreviewDTO,
} from "@/features/contract-expirations/dto/contract-expiration-preview-dto";

import { ContractExpirationRepository } from "@/features/contract-expirations/repositories/contract-expiration-repository";

import { ContractService } from "@/features/contracts/services/contract-service";
import { SeasonService } from "@/features/seasons/services/season-service";

function unwrapRelation<T>(
  value:
    | T
    | T[]
    | null
    | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

export const ContractExpirationPreviewService = {
  async getPreview(params: {
    leagueId: string;
  }): Promise<ContractExpirationPreviewDTO> {
    const [
      activeSeason,
      contracts,
    ] = await Promise.all([
      SeasonService.getActiveSeasonByLeague(
        params.leagueId,
      ),

      ContractService.getLeagueContracts(
        params.leagueId,
      ),
    ]);

    if (!activeSeason) {
      throw new Error(
        "This league does not have an active season.",
      );
    }

    /*
     * Only active contracts ending with
     * the current season are expiring.
     */
    const expiringContracts =
      contracts.filter(
        (contract) =>
          contract.status ===
            "active" &&
          contract.endSeasonId ===
            activeSeason.id,
      );

    const tagUsages =
      await ContractExpirationRepository.getTagUsagesForSourceSeason(
        {
          leagueId:
            params.leagueId,

          sourceContractIds:
            expiringContracts.map(
              (contract) =>
                contract.id,
            ),
        },
      );

    const tagByContractId =
      new Map(
        tagUsages
          .filter(
            (usage) =>
              Boolean(
                usage.source_contract_id,
              ),
          )
          .map(
            (usage) => [
              usage.source_contract_id!,
              usage,
            ],
          ),
      );

    const players: ContractExpirationPlayerDTO[] =
      expiringContracts.map(
        (contract) => {
          const finalYear =
            contract.years.find(
              (year) =>
                year.seasonId ===
                activeSeason.id,
            );

          if (!finalYear) {
            throw new Error(
              `${contract.playerName} does not have a contract year for ${activeSeason.name}.`,
            );
          }

          const tagUsage =
            tagByContractId.get(
              contract.id,
            );

          if (!tagUsage) {
            return {
              contractId:
                contract.id,

              teamId:
                contract.teamId,

              teamName:
                contract.teamName,

              leaguePlayerId:
                contract.leaguePlayerId,

              playerId:
                contract.playerId,

              playerName:
                contract.playerName,

              position:
                contract.position,

              proTeam:
                contract.proTeam,

              finalCapHit:
                finalYear.capHit,

              outcome:
                "free_agent",

              tagSeasonId:
                null,

              tagSeasonName:
                null,

              tagCapHit:
                null,
            };
          }

          const tagSeason =
            unwrapRelation(
              tagUsage.seasons,
            );

          return {
            contractId:
              contract.id,

            teamId:
              contract.teamId,

            teamName:
              contract.teamName,

            leaguePlayerId:
              contract.leaguePlayerId,

            playerId:
              contract.playerId,

            playerName:
              contract.playerName,

            position:
              contract.position,

            proTeam:
              contract.proTeam,

            finalCapHit:
              finalYear.capHit,

            outcome:
              "franchise_tag",

            tagSeasonId:
              tagUsage.season_id,

            tagSeasonName:
              tagSeason?.name ??
              "Unknown Season",

            tagCapHit:
              Number(
                tagUsage.tag_cap_hit ??
                0,
              ),
          };
        },
      );

    const totalTagged =
      players.filter(
        (player) =>
          player.outcome ===
          "franchise_tag",
      ).length;

    const totalEnteringFreeAgency =
      players.length -
      totalTagged;

    return {
      leagueId:
        params.leagueId,

      seasonId:
        activeSeason.id,

      seasonName:
        activeSeason.name,

      seasonYear:
        Number(
          activeSeason.year,
        ),

      totalExpiring:
        players.length,

      totalTagged,

      totalEnteringFreeAgency,

      players:
        players.sort(
          (a, b) =>
            a.playerName.localeCompare(
              b.playerName,
            ),
        ),
    };
  },
};
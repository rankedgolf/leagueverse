import type { FranchiseTagPreviewDTO } from "@/features/franchise-tags/dto/franchise-tag-preview-dto";

import { ContractService } from "@/features/contracts/services/contract-service";
import { SeasonService } from "@/features/seasons/services/season-service";

import { FranchiseTagRepository } from "@/features/franchise-tags/repositories/franchise-tag-repository";

function roundCurrency(
  value: number,
): number {
  return (
    Math.round(
      (value + Number.EPSILON) *
        100,
    ) / 100
  );
}

export const FranchiseTagPreviewService = {
  async getPreview(params: {
    leagueId: string;
    contractId: string;
  }): Promise<FranchiseTagPreviewDTO> {
    const [
      contracts,
      activeSeason,
      seasons,
    ] = await Promise.all([
      ContractService.getLeagueContracts(
        params.leagueId,
      ),

      SeasonService.getActiveSeasonByLeague(
        params.leagueId,
      ),

      SeasonService.getLeagueSeasons(
        params.leagueId,
      ),
    ]);

    if (!activeSeason) {
      throw new Error(
        "This league does not have an active season.",
      );
    }

    const contract =
      contracts.find(
        (row) =>
          row.id ===
          params.contractId,
      );

    if (!contract) {
      throw new Error(
        "The contract could not be found.",
      );
    }

    if (
      contract.status !==
      "active"
    ) {
      throw new Error(
        "Only active contracts can receive a franchise tag.",
      );
    }

    if (
      contract.contractType ===
      "franchise_tag"
    ) {
      throw new Error(
        "A franchise-tagged player cannot be tagged again.",
      );
    }

    const expiringSeason =
      seasons.find(
        (season) =>
          season.id ===
          contract.endSeasonId,
      );

    if (!expiringSeason) {
      throw new Error(
        "The contract ending season could not be found.",
      );
    }

    const expiringSeasonYear =
      Number(
        expiringSeason.year,
      );

    const activeSeasonYear =
      Number(
        activeSeason.year,
      );

    if (
      expiringSeasonYear !==
      activeSeasonYear
    ) {
      throw new Error(
        "A franchise tag may only be applied to a contract expiring after the current season.",
      );
    }

    const expiringContractYear =
      contract.years.find(
        (year) =>
          year.seasonId ===
          contract.endSeasonId,
      );

    if (!expiringContractYear) {
      throw new Error(
        "The final contract year could not be found.",
      );
    }

    /*
     * Find or provision the season
     * immediately after contract expiration.
     */
    let tagSeason =
      seasons.find(
        (season) =>
          Number(
            season.year,
          ) ===
          expiringSeasonYear + 1,
      );

    if (!tagSeason) {
      const contractSeasons =
        await SeasonService.getContractSeasons({
          leagueId:
            params.leagueId,

          startSeasonId:
            activeSeason.id,

          lengthYears:
            2,
        });

      tagSeason =
        contractSeasons.find(
          (season) =>
            Number(
              season.year,
            ) ===
            expiringSeasonYear + 1,
        );
    }

    if (!tagSeason) {
      throw new Error(
        "LeagueVerse could not determine the franchise tag season.",
      );
    }

    const [
      existingTeamTag,
      playerTagHistory,
    ] = await Promise.all([
      FranchiseTagRepository.getTeamTagUsage(
        {
          leagueId:
            params.leagueId,

          teamId:
            contract.teamId,

          seasonId:
            tagSeason.id,
        },
      ),

      FranchiseTagRepository.getPlayerTagHistory(
        {
          leagueId:
            params.leagueId,

          leaguePlayerId:
            contract.leaguePlayerId,
        },
      ),
    ]);

    let tagAvailable = true;
    let unavailableReason:
      string | null = null;

    if (existingTeamTag) {
      tagAvailable = false;

      unavailableReason =
        "This team has already used its franchise tag for this season.";
    }

   const wasTaggedPreviousSeason =
  playerTagHistory.some((usage) => {
    const seasonRelation =
      Array.isArray(usage.seasons)
        ? usage.seasons[0]
        : usage.seasons;

    return (
      Number(seasonRelation?.year ?? 0) ===
      expiringSeasonYear
    );
  });

if (wasTaggedPreviousSeason) {
  tagAvailable = false;

  unavailableReason =
    "This player was franchise tagged last season and cannot be tagged in consecutive seasons.";
}

    const previousCapHit =
      roundCurrency(
        expiringContractYear.capHit,
      );

    const tagCapHit =
      roundCurrency(
        previousCapHit *
          1.2,
      );

    const tagPremium =
      roundCurrency(
        tagCapHit -
          previousCapHit,
      );

    return {
      leagueId:
        params.leagueId,

      teamId:
        contract.teamId,

      contractId:
        contract.id,

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

      expiringSeasonId:
        expiringSeason.id,

      expiringSeasonName:
        expiringSeason.name,

      expiringSeasonYear,

      tagSeasonId:
        tagSeason.id,

      tagSeasonName:
        tagSeason.name,

      tagSeasonYear:
        Number(
          tagSeason.year,
        ),

      previousCapHit,

      tagCapHit,

      tagPremium,

      tagAvailable,

      unavailableReason,
    };
  },
};
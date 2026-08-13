import type {
  ReleasePreviewDTO,
  ReleasePreviewYearDTO,
} from "@/features/releases/dto/release-preview-dto";

import { ContractService } from "@/features/contracts/services/contract-service";
import { SeasonService } from "@/features/seasons/services/season-service";

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

export const ReleasePreviewService = {
  async getPreview(params: {
    leagueId: string;
    contractId: string;
  }): Promise<ReleasePreviewDTO> {
    const [
      contracts,
      activeSeason,
    ] = await Promise.all([
      ContractService.getLeagueContracts(
        params.leagueId,
      ),

      SeasonService.getActiveSeasonByLeague(
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
        "Only active contracts can be released.",
      );
    }

    const activeSeasonIndex =
      contract.years.findIndex(
        (year) =>
          year.seasonId ===
          activeSeason.id,
      );

    if (
      activeSeasonIndex === -1
    ) {
      throw new Error(
        "This contract does not contain the active league season.",
      );
    }

    const remainingYears =
      contract.years.slice(
        activeSeasonIndex,
      );

    const years: ReleasePreviewYearDTO[] =
      remainingYears.map(
        (year, index) => {
          const currentCapHit =
            roundCurrency(
              year.capHit,
            );

          const deadCap =
            roundCurrency(
              year.guaranteedAmount,
            );

          const capSavings =
            roundCurrency(
              Math.max(
                0,
                currentCapHit -
                  deadCap,
              ),
            );

          return {
            seasonId:
              year.seasonId,

            seasonName:
              year.seasonName,

            seasonYear:
              Number(
                activeSeason.year,
              ) + index,

            currentCapHit,

            deadCap,

            capSavings,
          };
        },
      );

    const totalRemainingCapHit =
      roundCurrency(
        years.reduce(
          (total, year) =>
            total +
            year.currentCapHit,
          0,
        ),
      );

    const totalDeadCap =
      roundCurrency(
        years.reduce(
          (total, year) =>
            total +
            year.deadCap,
          0,
        ),
      );

    const totalCapSavings =
      roundCurrency(
        years.reduce(
          (total, year) =>
            total +
            year.capSavings,
          0,
        ),
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

      currentSeasonId:
        activeSeason.id,

      currentSeasonName:
        activeSeason.name,

      years,

      totalRemainingCapHit,

      totalDeadCap,

      totalCapSavings,
    };
  },
};
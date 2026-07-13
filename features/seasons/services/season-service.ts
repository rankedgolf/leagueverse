import { SeasonRepository } from "@/features/seasons/repositories/season-repository";

export const SeasonService = {
  async getActiveSeasonByLeague(leagueId: string) {
    return SeasonRepository.getActiveByLeague(leagueId);
  },

  async getLeagueSeasons(leagueId: string) {
    return SeasonRepository.getByLeague(leagueId);
  },

 async getContractSeasons(params: {
  leagueId: string;
  startSeasonId: string;
  lengthYears: number;
}) {
  const { SeasonProvisioningService } = await import(
    "@/features/seasons/services/season-provisioning-service"
  );

  let seasons = await SeasonRepository.getByLeague(params.leagueId);

  const startSeason = seasons.find(
    (season) => season.id === params.startSeasonId
  );

  if (!startSeason) {
    throw new Error("The selected starting season was not found.");
  }

  const startYear = Number(startSeason.year);

  if (!Number.isInteger(startYear)) {
    throw new Error("The starting season must have a valid year.");
  }

  const finalContractYear = startYear + params.lengthYears - 1;

  const highestExistingYear = Math.max(
    ...seasons
      .map((season) => Number(season.year))
      .filter((year) => Number.isInteger(year))
  );

  if (highestExistingYear < finalContractYear) {
    const activeSeason = seasons.find((season) => season.is_active);

    if (!activeSeason || !Number.isInteger(Number(activeSeason.year))) {
      throw new Error("No valid active season was found.");
    }

    const requiredSeasonCount =
      finalContractYear - Number(activeSeason.year) + 1;

    seasons =
      await SeasonProvisioningService.ensureFutureSeasons({
        leagueId: params.leagueId,
        requiredSeasonCount,
      });
  }

  const contractSeasons = seasons
    .filter((season) => {
      const year = Number(season.year);

      return (
        Number.isInteger(year) &&
        year >= startYear &&
        year <= finalContractYear
      );
    })
    .sort((a, b) => Number(a.year) - Number(b.year));

  if (contractSeasons.length !== params.lengthYears) {
    throw new Error(
      "LeagueVerse could not create the required contract seasons."
    );
  }

  return contractSeasons;
},
};
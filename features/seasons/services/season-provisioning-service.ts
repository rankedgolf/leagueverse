import { createClient } from "@/lib/supabase/server";
import { SeasonRepository } from "@/features/seasons/repositories/season-repository";

type EnsureFutureSeasonsInput = {
  leagueId: string;
  requiredSeasonCount: number;
};

export const SeasonProvisioningService = {
  async ensureFutureSeasons({
    leagueId,
    requiredSeasonCount,
  }: EnsureFutureSeasonsInput) {
    if (
      !Number.isInteger(requiredSeasonCount) ||
      requiredSeasonCount < 1
    ) {
      throw new Error("Required season count must be at least one.");
    }

    const existingSeasons = await SeasonRepository.getByLeague(leagueId);

    if (existingSeasons.length === 0) {
      throw new Error(
        "The league must have an active season before future seasons can be generated."
      );
    }

    const sortedSeasons = [...existingSeasons].sort((a, b) => {
      const yearA = Number(a.year ?? 0);
      const yearB = Number(b.year ?? 0);

      return yearA - yearB;
    });

    const activeSeason = sortedSeasons.find(
      (season) => season.is_active
    );

    if (!activeSeason) {
      throw new Error("No active season was found for this league.");
    }

    const activeYear = Number(activeSeason.year);

    if (!Number.isInteger(activeYear)) {
      throw new Error(
        "The active season must have a valid year before future seasons can be generated."
      );
    }

    const requiredYears = Array.from(
      { length: requiredSeasonCount },
      (_, index) => activeYear + index
    );

    const existingYears = new Set(
      sortedSeasons
        .map((season) => Number(season.year))
        .filter((year) => Number.isInteger(year))
    );

    const missingYears = requiredYears.filter(
      (year) => !existingYears.has(year)
    );

    if (missingYears.length > 0) {
      const supabase = await createClient();

      const { error } = await supabase.from("seasons").insert(
        missingYears.map((year) => ({
          league_id: leagueId,
          name: `${year} Season`,
          year,
          status: "future",
          is_active: false,
        }))
      );

      if (error) {
        throw new Error(error.message);
      }
    }

    return SeasonRepository.getByLeague(leagueId);
  },
};
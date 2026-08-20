import type { RookieDraftSetupDTO } from "@/features/rookie-draft/dto/rookie-draft-setup-dto";

import { RookieDraftRepository } from "@/features/rookie-draft/repositories/rookie-draft-repository";

import { SeasonService } from "@/features/seasons/services/season-service";

export const RookieDraftSetupService = {
  async getSetup(params: {
    leagueId: string;
  }): Promise<RookieDraftSetupDTO> {
    const [
      activeSeason,
      seasons,
    ] = await Promise.all([
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

    const activeYear =
      Number(
        activeSeason.year,
      );

    const draftSeason =
      seasons
        .filter(
          (season) =>
            Number(
              season.year,
            ) >
            activeYear,
        )
        .sort(
          (a, b) =>
            Number(
              a.year,
            ) -
            Number(
              b.year,
            ),
        )[0];

    if (!draftSeason) {
      throw new Error(
        "The next rookie draft season could not be found.",
      );
    }

    const [
      picks,
      existingDraft,
    ] = await Promise.all([
      RookieDraftRepository.getDraftPicksForSeason(
        {
          leagueId:
            params.leagueId,

          seasonId:
            draftSeason.id,
        },
      ),

      RookieDraftRepository.getByLeagueAndSeason(
        {
          leagueId:
            params.leagueId,

          seasonId:
            draftSeason.id,
        },
      ),
    ]);

    const numberedPicks =
      picks.filter(
        (pick) =>
          pick.pick_number !==
          null,
      ).length;

    const unnumberedPicks =
      picks.length -
      numberedPicks;

    const rounds =
      picks.length > 0
        ? Math.max(
            ...picks.map(
              (pick) =>
                Number(
                  pick.round,
                ),
            ),
          )
        : 0;

    return {
      leagueId:
        params.leagueId,

      operationSeasonId:
        activeSeason.id,

      operationSeasonYear:
        activeYear,

      draftSeasonId:
        draftSeason.id,

      draftSeasonYear:
        Number(
          draftSeason.year,
        ),

      rookieDraftId:
        existingDraft?.id ??
        null,

      rounds,

      totalPicks:
        picks.length,

      numberedPicks,

      unnumberedPicks,

      readyToOpen:
        picks.length > 0 &&
        unnumberedPicks === 0,

      picks:
        picks.map(
          (pick) => ({
            draftPickId:
              pick.id,

            round:
              Number(
                pick.round,
              ),

            pickNumber:
              pick.pick_number,

            originalTeamId:
              pick.original_team_id,

            currentTeamId:
              pick.current_team_id,
          }),
        ),
    };
  },
};
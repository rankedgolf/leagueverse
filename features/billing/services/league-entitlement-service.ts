import { createClient } from "@/lib/supabase/server";

export type LeagueEntitlementStatus = {
  isActivated: boolean;
  seasonId: string | null;
  seasonYear: number | null;
};

export const LeagueEntitlementService = {
  async getStatus(
    leagueId: string,
  ): Promise<LeagueEntitlementStatus> {
    const supabase =
      await createClient();

    /*
     * Use seasons.is_active as the
     * source of truth.
     */
    const {
      data: season,
      error: seasonError,
    } =
      await supabase
        .from("seasons")
        .select(`
          id,
          year
        `)
        .eq(
          "league_id",
          leagueId,
        )
        .eq(
          "is_active",
          true,
        )
        .maybeSingle();

    if (seasonError) {
      throw new Error(
        seasonError.message,
      );
    }

    if (!season) {
      return {
        isActivated:
          false,

        seasonId:
          null,

        seasonYear:
          null,
      };
    }

    const {
      data: entitlement,
      error: entitlementError,
    } =
      await supabase
        .from(
          "league_entitlements",
        )
        .select(`
          id,
          status
        `)
        .eq(
          "league_id",
          leagueId,
        )
        .eq(
          "season_year",
          season.year,
        )
        .eq(
          "status",
          "paid",
        )
        .maybeSingle();

    if (entitlementError) {
      throw new Error(
        entitlementError.message,
      );
    }

    return {
      isActivated:
        Boolean(entitlement),

      seasonId:
        season.id,

      seasonYear:
        season.year,
    };
  },

  async hasActiveEntitlement(
    leagueId: string,
  ) {
    const status =
      await this.getStatus(
        leagueId,
      );

    return status.isActivated;
  },
};
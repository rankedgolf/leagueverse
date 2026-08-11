import { createClient } from "@/lib/supabase/server";

import type { FreeAgencyPersonality } from "@/features/free-agency/lib/free-agency-personality";

type CreateProfileInput = {
  leagueId: string;
  leaguePlayerId: string;
  personality: FreeAgencyPersonality;
};

export const FreeAgencyProfileRepository = {
  async getByLeague(
    leagueId: string,
  ) {
    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from(
          "player_free_agency_profiles",
        )
        .select(`
          id,
          league_id,
          league_player_id,
          money_weight,
          winning_weight,
          role_weight,
          security_weight,
          stability_weight,
          loyalty_weight,
          risk_tolerance,
          decision_tendency,
          personality_seed,
          created_at,
          updated_at
        `)
        .eq(
          "league_id",
          leagueId,
        );

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },

  async createMany(
    inputs: CreateProfileInput[],
  ) {
    if (inputs.length === 0) {
      return [];
    }

    const supabase =
      await createClient();

    const { data, error } =
      await supabase
        .from(
          "player_free_agency_profiles",
        )
        .upsert(
          inputs.map(
            ({
              leagueId,
              leaguePlayerId,
              personality,
            }) => ({
              league_id:
                leagueId,

              league_player_id:
                leaguePlayerId,

              money_weight:
                personality.moneyWeight,

              winning_weight:
                personality.winningWeight,

              role_weight:
                personality.roleWeight,

              security_weight:
                personality.securityWeight,

              stability_weight:
                personality.stabilityWeight,

              loyalty_weight:
                personality.loyaltyWeight,

              risk_tolerance:
                personality.riskTolerance,

              decision_tendency:
                personality.decisionTendency,

              personality_seed:
                personality.personalitySeed,

              updated_at:
                new Date().toISOString(),
            }),
          ),
          {
            onConflict:
              "league_id,league_player_id",

            ignoreDuplicates: true,
          },
        )
        .select(`
          id,
          league_player_id
        `);

    if (error) {
      throw new Error(
        error.message,
      );
    }

    return data ?? [];
  },
};
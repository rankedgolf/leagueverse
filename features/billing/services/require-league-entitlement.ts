import { LeagueEntitlementService } from "@/features/billing/services/league-entitlement-service";

export async function requireLeagueEntitlement(
  leagueId: string,
) {
  const entitlement =
    await LeagueEntitlementService.getStatus(
      leagueId,
    );

  if (!entitlement.isActivated) {
    throw new Error(
      "This league requires an active LeagueVerse pass.",
    );
  }

  return entitlement;
}
import { parseSleeperLeagueId } from "../providers/sleeper/parse-sleeper-league-id";
import { SleeperProvider } from "../providers/sleeper/sleeper-provider";

export type SleeperAuctionPickDTO = {
  playerId: string;
  playerName: string;
  position: string | null;
  nflTeam: string | null;
  rosterId: string;
  amount: number | null;
  pickNumber: number;
};

export type SleeperLeaguePreviewDTO = {
  externalLeagueId: string;
  leagueName: string;
  season: string;
  status: string;
  sport: string;
  totalRosters: number;
  userCount: number;
  rosterCount: number;
  playerCount: number;
  draftCount: number;
  latestDraftId: string | null;
  latestDraftType: string | null;
  latestDraftStatus: string | null;
  draftPickCount: number;
  auctionAmountCount: number;
  auctionTotalSpent: number;
  auctionPickSamples: SleeperAuctionPickDTO[];
};

function parseAuctionAmount(value: string | undefined): number | null {
  if (value === undefined || value.trim() === "") {
    return null;
  }

  const parsedAmount = Number(value);

  return Number.isFinite(parsedAmount) ? parsedAmount : null;
}

export const SleeperIntegrationService = {
  async previewLeague(
    leagueUrlOrId: string,
  ): Promise<SleeperLeaguePreviewDTO> {
    const externalLeagueId =
      parseSleeperLeagueId(leagueUrlOrId);

    const [league, users, rosters, drafts] = await Promise.all([
      SleeperProvider.getLeague(externalLeagueId),
      SleeperProvider.getUsers(externalLeagueId),
      SleeperProvider.getRosters(externalLeagueId),
      SleeperProvider.getDrafts(externalLeagueId),
    ]);

    const latestDraft = drafts[0] ?? null;

    const draftPicks = latestDraft
      ? await SleeperProvider.getDraftPicks(latestDraft.draft_id)
      : [];

    const uniquePlayerIds = new Set(
      rosters.flatMap((roster) => roster.players ?? []),
    );

    const mappedDraftPicks: SleeperAuctionPickDTO[] = draftPicks.map(
      (pick) => {
        const firstName = pick.metadata.first_name ?? "";
        const lastName = pick.metadata.last_name ?? "";

        return {
          playerId: pick.player_id,
          playerName:
            `${firstName} ${lastName}`.trim() || pick.player_id,
          position: pick.metadata.position ?? null,
          nflTeam: pick.metadata.team ?? null,
          rosterId: String(pick.roster_id),
          amount: parseAuctionAmount(pick.metadata.amount),
          pickNumber: pick.pick_no,
        };
      },
    );

    const picksWithAuctionAmounts = mappedDraftPicks.filter(
      (pick) => pick.amount !== null,
    );

    const auctionTotalSpent = picksWithAuctionAmounts.reduce(
      (total, pick) => total + (pick.amount ?? 0),
      0,
    );

    return {
      externalLeagueId,
      leagueName: league.name,
      season: league.season,
      status: league.status,
      sport: league.sport,
      totalRosters: league.total_rosters,
      userCount: users.length,
      rosterCount: rosters.length,
      playerCount: uniquePlayerIds.size,
      draftCount: drafts.length,
      latestDraftId: latestDraft?.draft_id ?? null,
      latestDraftType: latestDraft?.type ?? null,
      latestDraftStatus: latestDraft?.status ?? null,
      draftPickCount: mappedDraftPicks.length,
      auctionAmountCount: picksWithAuctionAmounts.length,
      auctionTotalSpent,
      auctionPickSamples: mappedDraftPicks.slice(0, 10),
    };
  },
};
import type {
  SleeperDraft,
  SleeperDraftPick,
  SleeperLeague,
  SleeperPlayer,
  SleeperRoster,
  SleeperUser,
} from "./sleeper-types";

const SLEEPER_API_BASE_URL =
  "https://api.sleeper.app/v1";

async function sleeperFetch<T>(
  path: string,
): Promise<T> {
  const response = await fetch(
    `${SLEEPER_API_BASE_URL}${path}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Sleeper API request failed: ${response.status} ${response.statusText}`,
    );
  }

  return (await response.json()) as T;
}

export const SleeperProvider = {
  async getLeague(
    externalLeagueId: string,
  ): Promise<SleeperLeague> {
    return sleeperFetch<SleeperLeague>(
      `/league/${encodeURIComponent(
        externalLeagueId,
      )}`,
    );
  },

  async getUsers(
    externalLeagueId: string,
  ): Promise<SleeperUser[]> {
    return sleeperFetch<SleeperUser[]>(
      `/league/${encodeURIComponent(
        externalLeagueId,
      )}/users`,
    );
  },

  async getRosters(
    externalLeagueId: string,
  ): Promise<SleeperRoster[]> {
    return sleeperFetch<SleeperRoster[]>(
      `/league/${encodeURIComponent(
        externalLeagueId,
      )}/rosters`,
    );
  },

  async getDrafts(
    externalLeagueId: string,
  ): Promise<SleeperDraft[]> {
    return sleeperFetch<SleeperDraft[]>(
      `/league/${encodeURIComponent(
        externalLeagueId,
      )}/drafts`,
    );
  },

  async getDraftPicks(
    draftId: string,
  ): Promise<SleeperDraftPick[]> {
    return sleeperFetch<SleeperDraftPick[]>(
      `/draft/${encodeURIComponent(
        draftId,
      )}/picks`,
    );
  },

  async getAllNflPlayers(): Promise<
    Record<string, SleeperPlayer>
  > {
    return sleeperFetch<
      Record<string, SleeperPlayer>
    >("/players/nfl");
  },
};
import { createClient } from "@/lib/supabase/server";

import type {
  ManualImportPreview,
  ManualImportRoster,
} from "@/features/manual-import/services/workbook-parser";

export type ManualImportPlayerMatchStatus =
  | "matched"
  | "ambiguous"
  | "unmatched";

export type ManualImportPlayerMatch = {
  teamName: string;

  importedPlayerName: string;

  importedPosition: string | null;

  importedNflTeam: string | null;

  status: ManualImportPlayerMatchStatus;

  playerId: string | null;

  matchedPlayerName: string | null;

  matchedPosition: string | null;

  matchedNflTeam: string | null;

  candidateCount: number;
};

export type ManualImportPlayerMatching = {
  total: number;

  matched: number;

  ambiguous: number;

  unmatched: number;

  canImport: boolean;

  matches: ManualImportPlayerMatch[];
};

function normalizeName(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function normalizeCode(
  value: string | null,
): string {
  return (
    value
      ?.trim()
      .toUpperCase() ??
    ""
  );
}

function getStoredPlayerName(player: {
  display_name: string | null;
  full_name: string | null;
  first_name: string | null;
  last_name: string | null;
}) {
  return (
    player.display_name ??
    player.full_name ??
    [
      player.first_name,
      player.last_name,
    ]
      .filter(Boolean)
      .join(" ")
  );
}

function resolveRosterPlayer(params: {
  roster: ManualImportRoster;

  players: Array<{
    id: string;

    display_name: string | null;

    full_name: string | null;

    first_name: string | null;

    last_name: string | null;

    position: string | null;

    nfl_team: string | null;

    pro_team: string | null;

    sport: string | null;

    status: string | null;
  }>;
}): ManualImportPlayerMatch {
  const {
    roster,
    players,
  } = params;

  const normalizedImportedName =
    normalizeName(
      roster.playerName,
    );

  const nameMatches =
    players.filter(
      (player) => {
        const storedName =
          getStoredPlayerName(
            player,
          );

        return (
          normalizeName(
            storedName,
          ) ===
          normalizedImportedName
        );
      },
    );

  /*
   * No exact normalized name match.
   *
   * Do not attempt fuzzy matching.
   */
  if (
    nameMatches.length === 0
  ) {
    return {
      teamName:
        roster.teamName,

      importedPlayerName:
        roster.playerName,

      importedPosition:
        roster.position,

      importedNflTeam:
        roster.nflTeam,

      status:
        "unmatched",

      playerId:
        null,

      matchedPlayerName:
        null,

      matchedPosition:
        null,

      matchedNflTeam:
        null,

      candidateCount:
        0,
    };
  }

  /*
   * Perfect situation:
   * only one player has this normalized name.
   */
  if (
    nameMatches.length === 1
  ) {
    const player =
      nameMatches[0];

    return {
      teamName:
        roster.teamName,

      importedPlayerName:
        roster.playerName,

      importedPosition:
        roster.position,

      importedNflTeam:
        roster.nflTeam,

      status:
        "matched",

      playerId:
        player.id,

      matchedPlayerName:
        getStoredPlayerName(
          player,
        ),

      matchedPosition:
        player.position,

      matchedNflTeam:
        player.nfl_team ??
        player.pro_team,

      candidateCount:
        1,
    };
  }

  /*
   * Multiple players share the same normalized name.
   *
   * Try position + NFL team as safe tie-breakers.
   */
  let narrowedMatches =
    [...nameMatches];

  const importedPosition =
    normalizeCode(
      roster.position,
    );

  if (
    importedPosition
  ) {
    const positionMatches =
      narrowedMatches.filter(
        (player) =>
          normalizeCode(
            player.position,
          ) ===
          importedPosition,
      );

    if (
      positionMatches.length >
      0
    ) {
      narrowedMatches =
        positionMatches;
    }
  }

  const importedTeam =
    normalizeCode(
      roster.nflTeam,
    );

  if (
    importedTeam
  ) {
    const teamMatches =
      narrowedMatches.filter(
        (player) =>
          normalizeCode(
            player.nfl_team ??
              player.pro_team,
          ) ===
          importedTeam,
      );

    if (
      teamMatches.length >
      0
    ) {
      narrowedMatches =
        teamMatches;
    }
  }

  if (
    narrowedMatches.length ===
    1
  ) {
    const player =
      narrowedMatches[0];

    return {
      teamName:
        roster.teamName,

      importedPlayerName:
        roster.playerName,

      importedPosition:
        roster.position,

      importedNflTeam:
        roster.nflTeam,

      status:
        "matched",

      playerId:
        player.id,

      matchedPlayerName:
        getStoredPlayerName(
          player,
        ),

      matchedPosition:
        player.position,

      matchedNflTeam:
        player.nfl_team ??
        player.pro_team,

      candidateCount:
        nameMatches.length,
    };
  }

  return {
    teamName:
      roster.teamName,

    importedPlayerName:
      roster.playerName,

    importedPosition:
      roster.position,

    importedNflTeam:
      roster.nflTeam,

    status:
      "ambiguous",

    playerId:
      null,

    matchedPlayerName:
      null,

    matchedPosition:
      null,

    matchedNflTeam:
      null,

    candidateCount:
      nameMatches.length,
  };
}

export const ManualImportPlayerMatcher = {
  async build(
    preview: ManualImportPreview,
  ): Promise<ManualImportPlayerMatching> {
    const supabase =
      await createClient();

    const playerMap =
      new Map<
        string,
        {
          id: string;
          display_name: string | null;
          full_name: string | null;
          first_name: string | null;
          last_name: string | null;
          position: string | null;
          nfl_team: string | null;
          pro_team: string | null;
          sport: string | null;
          status: string | null;
        }
      >();

    /*
     * Load the complete active NFL player catalog.
     *
     * Use a stable primary-key order because this query
     * is paginated. The Map also protects against a
     * duplicate row ever appearing across page boundaries.
     */
    const pageSize = 1000;

    let from = 0;

    while (true) {
      const {
        data,
        error,
      } =
        await supabase
          .from("players")
          .select(`
            id,
            display_name,
            full_name,
            first_name,
            last_name,
            position,
            nfl_team,
            pro_team,
            sport,
            status
          `)
          .eq(
            "sport",
            "nfl",
          )
          .eq(
            "status",
            "active",
          )
          .order(
            "id",
            {
              ascending: true,
            },
          )
          .range(
            from,
            from +
              pageSize -
              1,
          );

      if (error) {
        throw new Error(
          error.message,
        );
      }

      const page =
        data ?? [];

      for (
        const player of page
      ) {
        playerMap.set(
          player.id,
          player,
        );
      }

      if (
        page.length <
        pageSize
      ) {
        break;
      }

      from +=
        pageSize;
    }

    const players =
      Array.from(
        playerMap.values(),
      );

    const matches =
      preview.rosters.map(
        (roster) =>
          resolveRosterPlayer({
            roster,
            players,
          }),
      );

    const matched =
      matches.filter(
        (match) =>
          match.status ===
          "matched",
      ).length;

    const ambiguous =
      matches.filter(
        (match) =>
          match.status ===
          "ambiguous",
      ).length;

    const unmatched =
      matches.filter(
        (match) =>
          match.status ===
          "unmatched",
      ).length;

    return {
      total:
        matches.length,

      matched,

      ambiguous,

      unmatched,

      canImport:
        ambiguous === 0 &&
        unmatched === 0,

      matches,
    };
  },
};
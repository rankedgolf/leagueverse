import type {
  SleeperDraftPick,
  SleeperRoster,
  SleeperUser,
} from "@/features/integrations/providers/sleeper/sleeper-types";
import type {
  SleeperImportPlayerDTO,
  SleeperImportPreviewDTO,
  SleeperImportTeamDTO,
} from "@/features/integrations/dto/sleeper-import-preview-dto";

import { SleeperProvider } from "@/features/integrations/providers/sleeper/sleeper-provider";

type BuildSleeperImportPreviewInput = {
  externalLeagueId: string;
  externalDraftId?: string | null;
  defaultContractYears?: number;
};

function parseAuctionAmount(
  value: string | undefined,
): number | null {
  if (value === undefined || value.trim() === "") {
    return null;
  }

  const amount = Number(value);

  return Number.isFinite(amount)
    ? amount
    : null;
}

function buildPlayerName(
  pick: SleeperDraftPick,
): string {
  const firstName =
    pick.metadata.first_name?.trim() ?? "";

  const lastName =
    pick.metadata.last_name?.trim() ?? "";

  return (
    `${firstName} ${lastName}`.trim() ||
    pick.player_id
  );
}

function getOwnerForRoster(
  roster: SleeperRoster,
  usersById: Map<string, SleeperUser>,
): SleeperUser | null {
  if (!roster.owner_id) {
    return null;
  }

  return usersById.get(roster.owner_id) ?? null;
}

function getTeamName(params: {
  roster: SleeperRoster;
  owner: SleeperUser | null;
}): string {
  const metadataTeamName =
    params.owner?.metadata?.team_name?.trim();

  if (metadataTeamName) {
    return metadataTeamName;
  }

  const ownerDisplayName =
    params.owner?.display_name?.trim();

  if (ownerDisplayName) {
    return `${ownerDisplayName}'s Team`;
  }

  return `Sleeper Team ${params.roster.roster_id}`;
}

export const SleeperImportPreviewService = {
  async build({
    externalLeagueId,
    externalDraftId,
    defaultContractYears = 1,
  }: BuildSleeperImportPreviewInput): Promise<SleeperImportPreviewDTO> {
    if (
      !Number.isInteger(defaultContractYears) ||
      defaultContractYears < 1
    ) {
      throw new Error(
        "Default contract years must be a positive whole number.",
      );
    }

    const [league, users, rosters, drafts] =
      await Promise.all([
        SleeperProvider.getLeague(externalLeagueId),
        SleeperProvider.getUsers(externalLeagueId),
        SleeperProvider.getRosters(externalLeagueId),
        SleeperProvider.getDrafts(externalLeagueId),
      ]);

    const selectedDraft =
      drafts.find(
        (draft) =>
          draft.draft_id === externalDraftId,
      ) ??
      drafts[0] ??
      null;

    const draftPicks = selectedDraft
      ? await SleeperProvider.getDraftPicks(
          selectedDraft.draft_id,
        )
      : [];

    const usersById = new Map(
      users.map((user) => [user.user_id, user]),
    );

    const rostersById = new Map(
      rosters.map((roster) => [
        String(roster.roster_id),
        roster,
      ]),
    );

    const teamNamesByRosterId = new Map<
      string,
      string
    >();

    const ownerNamesByRosterId = new Map<
      string,
      string | null
    >();

    for (const roster of rosters) {
      const rosterId = String(roster.roster_id);
      const owner = getOwnerForRoster(
        roster,
        usersById,
      );

      teamNamesByRosterId.set(
        rosterId,
        getTeamName({
          roster,
          owner,
        }),
      );

      ownerNamesByRosterId.set(
        rosterId,
        owner?.display_name ?? null,
      );
    }

    const draftPicksByPlayerId = new Map<
      string,
      SleeperDraftPick
    >();

    for (const pick of draftPicks) {
      draftPicksByPlayerId.set(
        pick.player_id,
        pick,
      );
    }

    const players: SleeperImportPlayerDTO[] = [];

    for (const roster of rosters) {
      const sleeperRosterId = String(
        roster.roster_id,
      );

      const teamName =
        teamNamesByRosterId.get(
          sleeperRosterId,
        ) ?? `Sleeper Team ${sleeperRosterId}`;

      const ownerDisplayName =
        ownerNamesByRosterId.get(
          sleeperRosterId,
        ) ?? null;

      for (const sleeperPlayerId of
        roster.players ?? []) {
        const warnings: string[] = [];
        const errors: string[] = [];

        const draftPick =
          draftPicksByPlayerId.get(
            sleeperPlayerId,
          ) ?? null;

        const auctionSalary = draftPick
          ? parseAuctionAmount(
              draftPick.metadata.amount,
            )
          : null;

        if (!draftPick) {
          warnings.push(
            "This rostered player was not found in the selected draft results.",
          );
        }

        if (auctionSalary === null) {
          errors.push(
            "An auction salary could not be determined.",
          );
        }

        if (
          auctionSalary !== null &&
          auctionSalary < 0
        ) {
          errors.push(
            "Auction salary cannot be negative.",
          );
        }

        const playerName = draftPick
          ? buildPlayerName(draftPick)
          : sleeperPlayerId;

        if (!draftPick?.metadata.position) {
          warnings.push(
            "Player position is unavailable.",
          );
        }

        if (!draftPick?.metadata.team) {
          warnings.push(
            "NFL team is unavailable.",
          );
        }

        players.push({
          sleeperPlayerId,
          sleeperRosterId,

          playerName,
          firstName:
            draftPick?.metadata.first_name ??
            null,
          lastName:
            draftPick?.metadata.last_name ??
            null,

          position:
            draftPick?.metadata.position ??
            null,
          proTeam:
            draftPick?.metadata.team ?? null,

          fantasyTeamName: teamName,
          ownerDisplayName,

          auctionSalary: auctionSalary ?? 0,
          contractYears:
            defaultContractYears,

          draftPickNumber:
            draftPick?.pick_no ?? null,

          warnings,
          errors,
          isValid: errors.length === 0,
        });
      }
    }

    players.sort((a, b) => {
      const teamComparison =
        a.fantasyTeamName.localeCompare(
          b.fantasyTeamName,
        );

      if (teamComparison !== 0) {
        return teamComparison;
      }

      return a.playerName.localeCompare(
        b.playerName,
      );
    });

    const teams: SleeperImportTeamDTO[] =
      rosters
        .map((roster) => {
          const sleeperRosterId = String(
            roster.roster_id,
          );

          const teamPlayers = players.filter(
            (player) =>
              player.sleeperRosterId ===
              sleeperRosterId,
          );

          return {
            sleeperRosterId,
            sleeperOwnerId:
              roster.owner_id ?? null,

            teamName:
              teamNamesByRosterId.get(
                sleeperRosterId,
              ) ??
              `Sleeper Team ${sleeperRosterId}`,

            ownerDisplayName:
              ownerNamesByRosterId.get(
                sleeperRosterId,
              ) ?? null,

            playerCount: teamPlayers.length,

            yearOneSalary: teamPlayers.reduce(
              (total, player) =>
                total +
                player.auctionSalary,
              0,
            ),

            contractYearsUsed:
              teamPlayers.reduce(
                (total, player) =>
                  total +
                  player.contractYears,
                0,
              ),
          };
        })
        .sort((a, b) =>
          a.teamName.localeCompare(
            b.teamName,
          ),
        );

    const playersWithAuctionPrices =
      players.filter(
        (player) =>
          player.auctionSalary >= 0 &&
          !player.errors.some((error) =>
            error
              .toLowerCase()
              .includes("auction salary"),
          ),
      );

    return {
      externalLeagueId,
      externalDraftId:
        selectedDraft?.draft_id ?? null,

      leagueName: league.name,
      season: league.season,
      sport: league.sport,

      defaultContractYears,

      teamCount: teams.length,
      playerCount: players.length,

      auctionPriceCount:
        playersWithAuctionPrices.length,

      auctionTotalSpent: players.reduce(
        (total, player) =>
          total + player.auctionSalary,
        0,
      ),

      validPlayerCount: players.filter(
        (player) => player.isValid,
      ).length,

      invalidPlayerCount: players.filter(
        (player) => !player.isValid,
      ).length,

      warningPlayerCount: players.filter(
        (player) =>
          player.warnings.length > 0,
      ).length,

      teams,
      players,
    };
  },
};
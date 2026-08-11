import type {
  SleeperSyncPlayerChangeDTO,
  SleeperSyncPreviewDTO,
  SleeperSyncTeamChangeDTO,
} from "@/features/integrations/dto/sleeper-sync-preview-dto";

import { IntegrationService } from "@/features/integrations/services/integration-service";
import { SleeperProvider } from "@/features/integrations/providers/sleeper/sleeper-provider";
import { SleeperSyncPreviewRepository } from "@/features/integrations/repositories/sleeper-sync-preview-repository";

type BuildSleeperSyncPreviewInput = {
  leagueId: string;
};

function unwrapRelation<T>(
  value: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }

  return value ?? null;
}

function getSleeperTeamName(params: {
  rosterId: string;
  ownerId: string | null;
  usersById: Map<
    string,
    {
      display_name: string;
      metadata?: {
        team_name?: string;
      };
    }
  >;
}): string {
  const owner = params.ownerId
    ? params.usersById.get(params.ownerId)
    : null;

  const customName =
    owner?.metadata?.team_name?.trim();

  if (customName) {
    return customName;
  }

  if (owner?.display_name) {
    return `${owner.display_name}'s Team`;
  }

  return `Sleeper Team ${params.rosterId}`;
}

export const SleeperSyncPreviewService = {
  async build({
    leagueId,
  }: BuildSleeperSyncPreviewInput): Promise<SleeperSyncPreviewDTO> {
    const integration =
      await IntegrationService.getLeagueIntegration(
        leagueId,
        "sleeper",
      );

    if (!integration || !integration.isConnected) {
      throw new Error(
        "This league is not connected to Sleeper.",
      );
    }

    const activeSeason =
      await SleeperSyncPreviewRepository.getActiveSeason(
        leagueId,
      );

    if (!activeSeason) {
      throw new Error(
        "The league does not have an active season.",
      );
    }

    const [
      sleeperUsers,
      sleeperRosters,
      teamMappings,
      leagueRoster,
    ] = await Promise.all([
      SleeperProvider.getUsers(
        integration.externalLeagueId,
      ),
      SleeperProvider.getRosters(
        integration.externalLeagueId,
      ),
      SleeperSyncPreviewRepository.getTeamMappings({
        leagueId,
        integrationId: integration.id,
      }),
      SleeperSyncPreviewRepository.getLeagueRoster({
        leagueId,
        seasonId: activeSeason.id,
      }),
    ]);

    const warnings: string[] = [];

    const usersById = new Map(
      sleeperUsers.map((user) => [
        user.user_id,
        user,
      ]),
    );

    const mappingByExternalRosterId = new Map(
      teamMappings.map((mapping) => [
        String(mapping.external_team_id),
        mapping,
      ]),
    );

    const leagueRosterByPlayerId = new Map(
      leagueRoster.map((row) => [
        row.player_id,
        row,
      ]),
    );

    const sleeperPlayerIds = Array.from(
      new Set(
        sleeperRosters.flatMap(
          (roster) => roster.players ?? [],
        ),
      ),
    );

    const matchedPlayers =
      await SleeperSyncPreviewRepository.getPlayersBySleeperIds(
        sleeperPlayerIds,
      );

    const playerBySleeperId = new Map(
      matchedPlayers
        .filter((player) => player.external_id)
        .map((player) => [
          player.external_id as string,
          player,
        ]),
    );

    const sleeperOwnershipByPlayerId = new Map<
      string,
      {
        sleeperRosterId: string;
        teamId: string | null;
        teamName: string | null;
      }
    >();

    const teamChanges: SleeperSyncTeamChangeDTO[] =
      [];

    for (const roster of sleeperRosters) {
      const sleeperRosterId = String(
        roster.roster_id,
      );

      const mapping =
        mappingByExternalRosterId.get(
          sleeperRosterId,
        ) ?? null;

      if (!mapping) {
        warnings.push(
          `Sleeper roster ${sleeperRosterId} is not mapped to a LeagueVerse team.`,
        );

        for (const sleeperPlayerId of
          roster.players ?? []) {
          sleeperOwnershipByPlayerId.set(
            sleeperPlayerId,
            {
              sleeperRosterId,
              teamId: null,
              teamName: null,
            },
          );
        }

        continue;
      }

      const teamRelation = unwrapRelation(
        mapping.teams,
      );

      const sleeperTeamName = getSleeperTeamName({
        rosterId: sleeperRosterId,
        ownerId: roster.owner_id,
        usersById,
      });

      const leagueVerseTeamName =
        teamRelation?.name ??
        mapping.external_team_name ??
        `Team ${mapping.team_id}`;

      const nameChanged =
        sleeperTeamName !==
        mapping.external_team_name;

      const ownerChanged =
        (roster.owner_id ?? null) !==
        (mapping.external_owner_id ?? null);

      if (nameChanged || ownerChanged) {
        teamChanges.push({
          sleeperRosterId,
          teamId: mapping.team_id,

          currentLeagueVerseName:
            leagueVerseTeamName,

          currentSleeperName:
            sleeperTeamName,

          previousExternalOwnerId:
            mapping.external_owner_id ?? null,

          currentExternalOwnerId:
            roster.owner_id ?? null,

          nameChanged,
          ownerChanged,
        });
      }

      for (const sleeperPlayerId of
        roster.players ?? []) {
        sleeperOwnershipByPlayerId.set(
          sleeperPlayerId,
          {
            sleeperRosterId,
            teamId: mapping.team_id,
            teamName: leagueVerseTeamName,
          },
        );
      }
    }

    const playerChanges: SleeperSyncPlayerChangeDTO[] =
      [];

    for (const sleeperPlayerId of sleeperPlayerIds) {
      const globalPlayer =
        playerBySleeperId.get(
          sleeperPlayerId,
        ) ?? null;

      const sleeperOwnership =
        sleeperOwnershipByPlayerId.get(
          sleeperPlayerId,
        ) ?? null;

      if (!globalPlayer) {
        playerChanges.push({
          sleeperPlayerId,
          playerId: null,
          playerName: sleeperPlayerId,
          changeType: "unmatched",

          fromTeamId: null,
          fromTeamName: null,

          toTeamId:
            sleeperOwnership?.teamId ?? null,
          toTeamName:
            sleeperOwnership?.teamName ?? null,

          sleeperRosterId:
            sleeperOwnership?.sleeperRosterId ??
            null,

          requiresCommissionerReview: true,
          message:
            "This Sleeper player does not have a matching LeagueVerse player record.",
        });

        continue;
      }

      const existingRoster =
        leagueRosterByPlayerId.get(
          globalPlayer.id,
        ) ?? null;

      if (!existingRoster) {
        playerChanges.push({
          sleeperPlayerId,
          playerId: globalPlayer.id,
          playerName:
            globalPlayer.display_name ??
            globalPlayer.full_name,

          changeType: "add",

          fromTeamId: null,
          fromTeamName: null,

          toTeamId:
            sleeperOwnership?.teamId ?? null,
          toTeamName:
            sleeperOwnership?.teamName ?? null,

          sleeperRosterId:
            sleeperOwnership?.sleeperRosterId ??
            null,

          requiresCommissionerReview: true,
          message:
            "Player is rostered in Sleeper but not currently rostered in LeagueVerse.",
        });

        continue;
      }

      const existingTeamRelation =
        unwrapRelation(existingRoster.teams);

      const targetTeamId =
        sleeperOwnership?.teamId ?? null;

      if (
        targetTeamId &&
        existingRoster.team_id !== targetTeamId
      ) {
        playerChanges.push({
          sleeperPlayerId,
          playerId: globalPlayer.id,
          playerName:
            globalPlayer.display_name ??
            globalPlayer.full_name,

          changeType: "move",

          fromTeamId:
            existingRoster.team_id,
          fromTeamName:
            existingTeamRelation?.name ?? null,

          toTeamId: targetTeamId,
          toTeamName:
            sleeperOwnership?.teamName ?? null,

          sleeperRosterId:
            sleeperOwnership?.sleeperRosterId ??
            null,

          requiresCommissionerReview: true,
          message:
            "Player is assigned to a different team in Sleeper.",
        });
      }
    }

    const sleeperPlayerIdSet = new Set(
      sleeperPlayerIds,
    );

    for (const rosterRow of leagueRoster) {
      const playerRelation = unwrapRelation(
        rosterRow.players,
      );

      const sleeperPlayerId =
        playerRelation?.external_id ?? null;

      if (
        !sleeperPlayerId ||
        sleeperPlayerIdSet.has(sleeperPlayerId)
      ) {
        continue;
      }

      const teamRelation = unwrapRelation(
        rosterRow.teams,
      );

      playerChanges.push({
        sleeperPlayerId,
        playerId: rosterRow.player_id,
        playerName:
          playerRelation?.display_name ??
          playerRelation?.full_name ??
          sleeperPlayerId,

        changeType: "drop",

        fromTeamId: rosterRow.team_id,
        fromTeamName:
          teamRelation?.name ?? null,

        toTeamId: null,
        toTeamName: null,
        sleeperRosterId: null,

        requiresCommissionerReview: true,
        message:
          "Player is rostered in LeagueVerse but is no longer rostered in Sleeper.",
      });
    }

    const addedPlayerCount =
      playerChanges.filter(
        (change) => change.changeType === "add",
      ).length;

    const droppedPlayerCount =
      playerChanges.filter(
        (change) => change.changeType === "drop",
      ).length;

    const movedPlayerCount =
      playerChanges.filter(
        (change) => change.changeType === "move",
      ).length;

    const unmatchedPlayerCount =
      playerChanges.filter(
        (change) =>
          change.changeType === "unmatched",
      ).length;

    return {
      leagueId,
      integrationId: integration.id,
      externalLeagueId:
        integration.externalLeagueId,

      sleeperRosterCount:
        sleeperPlayerIds.length,

      leagueVerseRosterCount:
        leagueRoster.length,

      addedPlayerCount,
      droppedPlayerCount,
      movedPlayerCount,
      unmatchedPlayerCount,

      teamChangeCount: teamChanges.length,
      warningCount: warnings.length,

      hasChanges:
        playerChanges.length > 0 ||
        teamChanges.length > 0,

      canApplyAutomatically:
        unmatchedPlayerCount === 0 &&
        warnings.length === 0,

      playerChanges,
      teamChanges,
      warnings,

      generatedAt: new Date().toISOString(),
    };
  },
};
import type {
  SleeperImportPlanDTO,
  SleeperImportPlanPlayerDTO,
  SleeperImportPlanTeamDTO,
} from "@/features/integrations/dto/sleeper-import-plan-dto";

import { ImportSessionRepository } from "@/features/integrations/repositories/import-session-repository";
import { SleeperImportPlanRepository } from "@/features/integrations/repositories/sleeper-import-plan-repository";
import { SleeperImportValidationService } from "@/features/integrations/services/sleeper-import-validation-service";

type BuildSleeperImportPlanInput = {
  leagueId: string;
  sessionId: string;
};

function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function unwrapRelation<T>(
  relation: T | T[] | null | undefined,
): T | null {
  if (Array.isArray(relation)) {
    return relation[0] ?? null;
  }

  return relation ?? null;
}

export const SleeperImportPlanService = {
  async build({
    leagueId,
    sessionId,
  }: BuildSleeperImportPlanInput): Promise<SleeperImportPlanDTO> {
    const [session, validation, existingData] =
      await Promise.all([
        ImportSessionRepository.getById({
          leagueId,
          sessionId,
        }),

        SleeperImportValidationService.validate({
          leagueId,
          sessionId,
        }),

        SleeperImportPlanRepository.getExistingLeagueData(
          leagueId,
        ),
      ]);

    if (!session) {
      throw new Error(
        "The Sleeper import session could not be found.",
      );
    }

    if (!session.previewData) {
      throw new Error(
        "The import session does not contain preview data.",
      );
    }

    if (!validation.isValid) {
      throw new Error(
        "The Sleeper import must pass validation before an import plan can be created.",
      );
    }

    const preview = session.previewData;
    const assignments =
      session.contractYearAssignments;

    const existingTeamsByName = new Map(
      existingData.teams.map((team) => [
        normalizeName(team.name),
        team,
      ]),
    );

    const existingLeaguePlayersByName = new Map<
      string,
      (typeof existingData.leaguePlayers)[number]
    >();

    for (const leaguePlayer of
      existingData.leaguePlayers) {
      const player = unwrapRelation(
        leaguePlayer.players,
      );

      if (!player) {
        continue;
      }

      const playerName =
        player.display_name ??
        player.full_name;

      if (!playerName) {
        continue;
      }

      existingLeaguePlayersByName.set(
        normalizeName(playerName),
        leaguePlayer,
      );
    }

    const activeContractByLeaguePlayerId =
      new Map(
        existingData.contracts.map((contract) => [
          contract.league_player_id,
          contract,
        ]),
      );

    const teams: SleeperImportPlanTeamDTO[] =
      preview.teams.map((team) => {
        const existingTeam =
          existingTeamsByName.get(
            normalizeName(team.teamName),
          ) ?? null;

        return {
          sleeperRosterId:
            team.sleeperRosterId,
          teamName: team.teamName,
          existingTeamId:
            existingTeam?.id ?? null,
          action: existingTeam
            ? "reuse"
            : "create",
        };
      });

    const planTeamByRosterId = new Map(
      teams.map((team) => [
        team.sleeperRosterId,
        team,
      ]),
    );

    const players: SleeperImportPlanPlayerDTO[] =
      preview.players.map((player) => {
        const warnings: string[] = [];

        const existingLeaguePlayer =
          existingLeaguePlayersByName.get(
            normalizeName(player.playerName),
          ) ?? null;

        const existingPlayerRelation =
          existingLeaguePlayer
            ? unwrapRelation(
                existingLeaguePlayer.players,
              )
            : null;

        const existingContract =
          existingLeaguePlayer
            ? activeContractByLeaguePlayerId.get(
                existingLeaguePlayer.id,
              ) ?? null
            : null;

        const targetTeam =
          planTeamByRosterId.get(
            player.sleeperRosterId,
          ) ?? null;

        const targetExistingTeamId =
          targetTeam?.existingTeamId ?? null;

        let rosterAction:
          | "assign"
          | "move"
          | "keep" = "assign";

        if (existingLeaguePlayer) {
          if (
            targetExistingTeamId &&
            existingLeaguePlayer.current_team_id ===
              targetExistingTeamId
          ) {
            rosterAction = "keep";
          } else if (
            existingLeaguePlayer.current_team_id
          ) {
            rosterAction = "move";
          }
        }

        if (existingContract) {
          warnings.push(
            `${player.playerName} already has an active LeagueVerse contract. The Sleeper contract will be skipped.`,
          );
        }

        if (
          existingLeaguePlayer &&
          rosterAction === "move"
        ) {
          warnings.push(
            `${player.playerName} is currently assigned to another LeagueVerse team and will need to be moved.`,
          );
        }

        return {
          sleeperPlayerId:
            player.sleeperPlayerId,
          sleeperRosterId:
            player.sleeperRosterId,

          playerName: player.playerName,
          fantasyTeamName:
            player.fantasyTeamName,

          auctionSalary:
            player.auctionSalary,
          contractYears:
            assignments[
              player.sleeperPlayerId
            ] ??
            session.defaultContractYears,

          existingPlayerId:
            existingPlayerRelation?.id ?? null,
          existingLeaguePlayerId:
            existingLeaguePlayer?.id ?? null,
          existingTeamId:
            existingLeaguePlayer
              ?.current_team_id ?? null,
          existingContractId:
            existingContract?.id ?? null,

          playerAction: existingPlayerRelation
            ? "reuse"
            : "create",

          leaguePlayerAction:
            existingLeaguePlayer
              ? "reuse"
              : "create",

          rosterAction,

          contractAction: existingContract
            ? "skip_existing"
            : "create",

          warnings,
        };
      });

    const warningCount = players.reduce(
      (total, player) =>
        total + player.warnings.length,
      0,
    );

    return {
      leagueId,
      sessionId,

      teamCount: teams.length,
      playerCount: players.length,

      teamsToCreate: teams.filter(
        (team) => team.action === "create",
      ).length,

      teamsToReuse: teams.filter(
        (team) => team.action === "reuse",
      ).length,

      playersToCreate: players.filter(
        (player) =>
          player.playerAction === "create",
      ).length,

      playersToReuse: players.filter(
        (player) =>
          player.playerAction === "reuse",
      ).length,

      leaguePlayersToCreate: players.filter(
        (player) =>
          player.leaguePlayerAction ===
          "create",
      ).length,

      leaguePlayersToReuse: players.filter(
        (player) =>
          player.leaguePlayerAction ===
          "reuse",
      ).length,

      rosterAssignmentsToCreate:
        players.filter(
          (player) =>
            player.rosterAction === "assign",
        ).length,

      rosterAssignmentsToMove:
        players.filter(
          (player) =>
            player.rosterAction === "move",
        ).length,

      rosterAssignmentsAlreadyCorrect:
        players.filter(
          (player) =>
            player.rosterAction === "keep",
        ).length,

      contractsToCreate: players.filter(
        (player) =>
          player.contractAction === "create",
      ).length,

      contractsToSkip: players.filter(
        (player) =>
          player.contractAction ===
          "skip_existing",
      ).length,

      warningCount,
      canImport: true,

      teams,
      players,
    };
  },
};
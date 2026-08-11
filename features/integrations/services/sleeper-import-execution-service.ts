import type { SleeperImportExecutionResultDTO } from "@/features/integrations/dto/sleeper-import-execution-dto";

import { ImportSessionRepository } from "@/features/integrations/repositories/import-session-repository";
import { SleeperImportExecutionRepository } from "@/features/integrations/repositories/sleeper-import-execution-repository";
import { SleeperImportPlanService } from "@/features/integrations/services/sleeper-import-plan-service";
import { SleeperImportValidationService } from "@/features/integrations/services/sleeper-import-validation-service";

type ExecuteSleeperImportInput = {
  leagueId: string;
  sessionId: string;
};

function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export const SleeperImportExecutionService = {
  async execute({
    leagueId,
    sessionId,
  }: ExecuteSleeperImportInput): Promise<SleeperImportExecutionResultDTO> {
    const warnings: string[] = [];
    const errors: string[] = [];

    const [session, validation, plan] = await Promise.all([
      ImportSessionRepository.getById({
        leagueId,
        sessionId,
      }),

      SleeperImportValidationService.validate({
        leagueId,
        sessionId,
      }),

      SleeperImportPlanService.build({
        leagueId,
        sessionId,
      }),
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
        "The Sleeper import must pass validation before execution.",
      );
    }

    if (!plan.canImport) {
      throw new Error(
        "The Sleeper import plan is not eligible for execution.",
      );
    }

    if (
      session.status === "completed" ||
      session.status === "cancelled"
    ) {
      throw new Error(
        "This import session can no longer be executed.",
      );
    }

    await ImportSessionRepository.update({
      leagueId,
      sessionId,
      status: "importing",
      currentStep: 4,
    });

    try {
      const preview = session.previewData;
      const assignments =
        session.contractYearAssignments;

      const [settings, seasons, existingTeams] =
        await Promise.all([
          SleeperImportExecutionRepository.getContractSettings(
            leagueId,
          ),
          SleeperImportExecutionRepository.getSeasons(
            leagueId,
          ),
          SleeperImportExecutionRepository.getTeams(
            leagueId,
          ),
        ]);

      const activeSeason =
        seasons.find(
          (season) => season.is_active,
        ) ?? seasons[0] ?? null;

      if (!activeSeason) {
        throw new Error(
          "The league does not have a season available for import.",
        );
      }

      const activeSeasonIndex = seasons.findIndex(
        (season) => season.id === activeSeason.id,
      );

      const maximumNeededYears = Math.max(
        ...Object.values(assignments),
        1,
      );

      const availableContractSeasons = seasons.slice(
        activeSeasonIndex,
        activeSeasonIndex + maximumNeededYears,
      );

      if (
        availableContractSeasons.length <
        maximumNeededYears
      ) {
        throw new Error(
          `The league needs at least ${maximumNeededYears} seasons beginning with ${activeSeason.name} before these contracts can be imported.`,
        );
      }

      const teamsByName = new Map(
        existingTeams.map((team) => [
          normalizeName(team.name),
          team,
        ]),
      );

      const teamsToCreate = preview.teams
        .filter(
          (team) =>
            !teamsByName.has(
              normalizeName(team.teamName),
            ),
        )
        .map((team) => ({
          leagueId,
          name: team.teamName,
        }));

      const createdTeams =
        await SleeperImportExecutionRepository.createTeams(
          teamsToCreate,
        );

      for (const team of createdTeams) {
        teamsByName.set(
          normalizeName(team.name),
          team,
        );
      }

      const teamIdByRosterId = new Map<
        string,
        string
      >();

      for (const team of preview.teams) {
        const leagueTeam = teamsByName.get(
          normalizeName(team.teamName),
        );

        if (!leagueTeam) {
          throw new Error(
            `LeagueVerse team mapping failed for ${team.teamName}.`,
          );
        }

        teamIdByRosterId.set(
          team.sleeperRosterId,
          leagueTeam.id,
        );
      }

      const sleeperPlayerIds =
        preview.players.map(
          (player) => player.sleeperPlayerId,
        );

      const existingPlayers =
        await SleeperImportExecutionRepository.getPlayersBySleeperIds(
          sleeperPlayerIds,
        );

      const playersBySleeperId = new Map(
        existingPlayers
          .filter(
            (player) => player.external_id,
          )
          .map((player) => [
            player.external_id as string,
            player,
          ]),
      );

      const playersToCreate = preview.players
        .filter(
          (player) =>
            !playersBySleeperId.has(
              player.sleeperPlayerId,
            ),
        )
        .map((player) => ({
          sleeperPlayerId:
            player.sleeperPlayerId,
          fullName: player.playerName,
          firstName: player.firstName,
          lastName: player.lastName,
          position: player.position,
          proTeam: player.proTeam,
        }));

      const createdPlayers =
        await SleeperImportExecutionRepository.createPlayers(
          playersToCreate,
        );

      for (const player of createdPlayers) {
        if (player.external_id) {
          playersBySleeperId.set(
            player.external_id,
            player,
          );
        }
      }

      const playerIds = Array.from(
        playersBySleeperId.values(),
      ).map((player) => player.id);

      const existingLeaguePlayers =
        await SleeperImportExecutionRepository.getLeaguePlayers({
          leagueId,
          playerIds,
        });

      const leaguePlayersByPlayerId = new Map(
        existingLeaguePlayers.map(
          (leaguePlayer) => [
            leaguePlayer.player_id,
            leaguePlayer,
          ],
        ),
      );

      const leaguePlayersToCreate = preview.players
        .filter((player) => {
          const globalPlayer =
            playersBySleeperId.get(
              player.sleeperPlayerId,
            );

          return (
            globalPlayer &&
            !leaguePlayersByPlayerId.has(
              globalPlayer.id,
            )
          );
        })
        .map((player) => {
          const globalPlayer =
            playersBySleeperId.get(
              player.sleeperPlayerId,
            );

          const teamId =
            teamIdByRosterId.get(
              player.sleeperRosterId,
            );

          if (!globalPlayer || !teamId) {
            throw new Error(
              `Unable to prepare league player record for ${player.playerName}.`,
            );
          }

          return {
            leagueId,
            playerId: globalPlayer.id,
            teamId,
          };
        });

      const createdLeaguePlayers =
        await SleeperImportExecutionRepository.createLeaguePlayers(
          leaguePlayersToCreate,
        );

      for (const leaguePlayer of createdLeaguePlayers) {
        leaguePlayersByPlayerId.set(
          leaguePlayer.player_id,
          leaguePlayer,
        );
      }

      const leaguePlayerTeamUpdates =
        preview.players.flatMap((player) => {
          const globalPlayer =
            playersBySleeperId.get(
              player.sleeperPlayerId,
            );

          const targetTeamId =
            teamIdByRosterId.get(
              player.sleeperRosterId,
            );

          if (!globalPlayer || !targetTeamId) {
            return [];
          }

          const leaguePlayer =
            leaguePlayersByPlayerId.get(
              globalPlayer.id,
            );

          if (
            !leaguePlayer ||
            leaguePlayer.current_team_id ===
              targetTeamId
          ) {
            return [];
          }

          return [
            {
              leaguePlayerId:
                leaguePlayer.id,
              teamId: targetTeamId,
            },
          ];
        });

      await SleeperImportExecutionRepository.updateLeaguePlayerTeams(
        leaguePlayerTeamUpdates,
      );

      const rosterAssignments =
        preview.players.map((player) => {
          const globalPlayer =
            playersBySleeperId.get(
              player.sleeperPlayerId,
            );

          const teamId =
            teamIdByRosterId.get(
              player.sleeperRosterId,
            );

          if (!globalPlayer || !teamId) {
            throw new Error(
              `Unable to prepare roster assignment for ${player.playerName}.`,
            );
          }

          return {
            leagueId,
            seasonId: activeSeason.id,
            teamId,
            playerId: globalPlayer.id,
          };
        });

      await SleeperImportExecutionRepository.upsertRosterAssignments(
        rosterAssignments,
      );

      const allLeaguePlayerIds = Array.from(
        leaguePlayersByPlayerId.values(),
      ).map((leaguePlayer) => leaguePlayer.id);

      const activeContracts =
        await SleeperImportExecutionRepository.getActiveContracts(
          {
            leagueId,
            leaguePlayerIds:
              allLeaguePlayerIds,
          },
        );

      const activeContractByLeaguePlayerId =
        new Map(
          activeContracts.map((contract) => [
            contract.league_player_id,
            contract,
          ]),
        );

      let contractsCreated = 0;
      let contractsSkipped = 0;
      let contractYearsCreated = 0;

      for (const player of preview.players) {
        const globalPlayer =
          playersBySleeperId.get(
            player.sleeperPlayerId,
          );

        if (!globalPlayer) {
          throw new Error(
            `Global player record is missing for ${player.playerName}.`,
          );
        }

        const leaguePlayer =
          leaguePlayersByPlayerId.get(
            globalPlayer.id,
          );

        const teamId =
          teamIdByRosterId.get(
            player.sleeperRosterId,
          );

        if (!leaguePlayer || !teamId) {
          throw new Error(
            `League player mapping is missing for ${player.playerName}.`,
          );
        }

        if (
          activeContractByLeaguePlayerId.has(
            leaguePlayer.id,
          )
        ) {
          contractsSkipped += 1;
          warnings.push(
            `${player.playerName} already had an active contract and was skipped.`,
          );
          continue;
        }

        const contractYears =
          assignments[
            player.sleeperPlayerId
          ] ??
          session.defaultContractYears;

        const contractSeasons =
          availableContractSeasons.slice(
            0,
            contractYears,
          );

        if (
          contractSeasons.length !==
          contractYears
        ) {
          throw new Error(
            `Not enough seasons exist to create ${player.playerName}'s ${contractYears}-year contract.`,
          );
        }

        const yearlySalaries =
          contractSeasons.map(
            (_season, index) =>
              roundCurrency(
                player.auctionSalary *
                  Math.pow(
                    1 +
                      Number(
                        settings.annual_inflation_rate,
                      ),
                    index,
                  ),
              ),
          );

        const totalValue =
          roundCurrency(
            yearlySalaries.reduce(
              (total, salary) =>
                total + salary,
              0,
            ),
          );

        const contract =
          await SleeperImportExecutionRepository.createContract(
            {
              leagueId,
              teamId,
              leaguePlayerId:
                leaguePlayer.id,
              startsSeasonId:
                contractSeasons[0].id,
              endsSeasonId:
                contractSeasons[
                  contractSeasons.length - 1
                ].id,
              totalValue,
            },
          );

        const contractYearRows =
          contractSeasons.map(
            (season, index) => ({
              contractId: contract.id,
              leagueId,
              seasonId: season.id,
              salary:
                yearlySalaries[index],
            }),
          );

        const createdContractYears =
          await SleeperImportExecutionRepository.createContractYears(
            contractYearRows,
          );

        contractsCreated += 1;
        contractYearsCreated +=
          createdContractYears.length;
      }

      const completedAt =
        new Date().toISOString();

      await ImportSessionRepository.update({
        leagueId,
        sessionId,
        status: "completed",
        currentStep: 5,
        completedAt,
      });

      return {
        success: true,
        leagueId,
        sessionId,

        teamsCreated:
          createdTeams.length,
        teamsReused:
          preview.teams.length -
          createdTeams.length,

        playersCreated:
          createdPlayers.length,
        playersReused:
          preview.players.length -
          createdPlayers.length,

        leaguePlayersCreated:
          createdLeaguePlayers.length,
        leaguePlayersReused:
          preview.players.length -
          createdLeaguePlayers.length,

        rosterAssignmentsCreated:
          rosterAssignments.length,
        rosterAssignmentsUpdated:
          leaguePlayerTeamUpdates.length,

        contractsCreated,
        contractsSkipped,

        contractYearsCreated,

        warnings,
        errors,
        completedAt,
      };
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "The Sleeper import failed.";

      errors.push(message);

      await ImportSessionRepository.update({
        leagueId,
        sessionId,
        status: "failed",
        currentStep: 4,
      });

      throw new Error(message);
    }
  },
};
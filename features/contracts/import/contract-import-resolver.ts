import type { ContractImportRow } from "./contract-import-parser";
import type { ContractImportRowValidation } from "./contract-import-validator";
import { TeamRepository } from "@/features/teams/repositories/team-repository";
import { LeaguePlayerRepository } from "@/features/league-players/repositories/league-player-repository";
import { ContractRepository } from "@/features/contracts/repositories/contract-repository";

export type ResolvedContractImportRow = {
  row: ContractImportRow;
  isValid: boolean;
  errors: string[];

  teamId: string | null;
  teamName: string | null;

  leaguePlayerId: string | null;
  playerId: string | null;
  playerName: string | null;
};

type ResolveContractImportRowsInput = {
  leagueId: string;
  validations: ContractImportRowValidation[];
};

function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export async function resolveContractImportRows({
  leagueId,
  validations,
}: ResolveContractImportRowsInput): Promise<
  ResolvedContractImportRow[]
> {
  const [teams, leaguePlayers] = await Promise.all([
    TeamRepository.getByLeague(leagueId),
    LeaguePlayerRepository.getByLeague(leagueId),
  ]);

  const duplicatePlayerNames = new Set<string>();
  const seenPlayerNames = new Set<string>();

  for (const validation of validations) {
    const normalizedPlayerName = normalizeName(
      validation.row.playerName
    );

    if (!normalizedPlayerName) {
      continue;
    }

    if (seenPlayerNames.has(normalizedPlayerName)) {
      duplicatePlayerNames.add(normalizedPlayerName);
    }

    seenPlayerNames.add(normalizedPlayerName);
  }

  return Promise.all(
    validations.map(async (validation) => {
      const errors = [...validation.errors];

      const normalizedTeamName = normalizeName(
        validation.row.fantasyTeam
      );

      const normalizedPlayerName = normalizeName(
        validation.row.playerName
      );

      const matchingTeams = teams.filter(
        (team) => normalizeName(team.name) === normalizedTeamName
      );

      const team =
        matchingTeams.length === 1 ? matchingTeams[0] : null;

      if (normalizedTeamName && matchingTeams.length === 0) {
        errors.push(
          `Fantasy team "${validation.row.fantasyTeam}" was not found.`
        );
      }

      if (matchingTeams.length > 1) {
        errors.push(
          `Multiple fantasy teams matched "${validation.row.fantasyTeam}".`
        );
      }

      const matchingLeaguePlayers = leaguePlayers.filter(
        (leaguePlayer) => {
          const playerRelation = Array.isArray(
            leaguePlayer.players
          )
            ? leaguePlayer.players[0]
            : leaguePlayer.players;

          const storedPlayerName =
            playerRelation?.display_name ??
            playerRelation?.full_name ??
            [
              playerRelation?.first_name,
              playerRelation?.last_name,
            ]
              .filter(Boolean)
              .join(" ");

          return (
            normalizeName(storedPlayerName ?? "") ===
            normalizedPlayerName
          );
        }
      );

      const leaguePlayer =
        matchingLeaguePlayers.length === 1
          ? matchingLeaguePlayers[0]
          : null;

      const playerRelation = leaguePlayer
        ? Array.isArray(leaguePlayer.players)
          ? leaguePlayer.players[0]
          : leaguePlayer.players
        : null;

      if (
        normalizedPlayerName &&
        matchingLeaguePlayers.length === 0
      ) {
        errors.push(
          `Player "${validation.row.playerName}" was not found in this league.`
        );
      }

      if (matchingLeaguePlayers.length > 1) {
        errors.push(
          `Multiple league players matched "${validation.row.playerName}".`
        );
      }

      if (duplicatePlayerNames.has(normalizedPlayerName)) {
        errors.push(
          "This player appears more than once in the import file."
        );
      }

      if (
        team &&
        leaguePlayer &&
        leaguePlayer.current_team_id !== team.id
      ) {
        errors.push(
          `${validation.row.playerName} is not currently rostered by ${team.name}.`
        );
      }

      if (leaguePlayer) {
        const activeContract =
          await ContractRepository.getActiveContractByLeaguePlayer(
            leagueId,
            leaguePlayer.id
          );

        if (activeContract) {
          errors.push(
            `${validation.row.playerName} already has an active contract.`
          );
        }
      }

      return {
        row: validation.row,
        isValid: errors.length === 0,
        errors,

        teamId: team?.id ?? null,
        teamName: team?.name ?? null,

        leaguePlayerId: leaguePlayer?.id ?? null,
        playerId: leaguePlayer?.player_id ?? null,
        playerName:
          playerRelation?.display_name ??
          playerRelation?.full_name ??
          validation.row.playerName ??
          null,
      };
    })
  );
}
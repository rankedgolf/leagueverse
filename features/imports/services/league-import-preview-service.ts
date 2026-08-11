import { createClient } from "@/lib/supabase/server";
import type { LeagueImportRow } from "@/features/imports/parsers/league-import-parser";
import {
  validateLeagueImportRows,
  type LeagueImportRowValidation,
} from "@/features/imports/validators/league-import-validator";
import { ContractSettingsService } from "@/features/contracts/services/contract-settings-service";
import { ContractCalculationService } from "@/features/contracts/services/contract-calculation-service";
import { TeamRepository } from "@/features/teams/repositories/team-repository";

export type LeagueImportMatchStatus =
  | "existing_league_player"
  | "existing_global_player"
  | "new_global_player";

export type LeagueImportPreviewRow = {
  row: LeagueImportRow;

  isValid: boolean;
  errors: string[];
  warnings: string[];

  teamId: string | null;
  teamName: string | null;

  playerId: string | null;
  leaguePlayerId: string | null;

  matchStatus: LeagueImportMatchStatus | null;

  totalValue: number;
  schedule: {
    yearNumber: number;
    salary: number;
    capHit: number;
  }[];
};

export type LeagueImportPreview = {
  totalRows: number;
  validRows: number;
  invalidRows: number;
  warningRows: number;
  newGlobalPlayers: number;
  newLeaguePlayers: number;
  existingLeaguePlayers: number;
  rows: LeagueImportPreviewRow[];
};

type BuildLeagueImportPreviewInput = {
  leagueId: string;
  rows: LeagueImportRow[];
};

function normalizeName(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

export const LeagueImportPreviewService = {
  async build({
    leagueId,
    rows,
  }: BuildLeagueImportPreviewInput): Promise<LeagueImportPreview> {
    const [settings, teams] = await Promise.all([
      ContractSettingsService.getByLeague(leagueId),
      TeamRepository.getByLeague(leagueId),
    ]);

    const validations: LeagueImportRowValidation[] =
      validateLeagueImportRows({
        rows,
        minimumSalary: settings.minimumSalary,
        maximumContractLength:
          settings.maximumContractLength,
      });

    const supabase = await createClient();

    const { data: globalPlayers, error: playersError } =
      await supabase
        .from("players")
        .select(`
          id,
          display_name,
          full_name,
          first_name,
          last_name,
          sport,
          external_id
        `);

    if (playersError) {
      throw new Error(playersError.message);
    }

    const { data: leaguePlayers, error: leaguePlayersError } =
      await supabase
        .from("league_players")
        .select(`
          id,
          league_id,
          player_id,
          current_team_id
        `)
        .eq("league_id", leagueId);

    if (leaguePlayersError) {
      throw new Error(leaguePlayersError.message);
    }

    const duplicateKeys = new Set<string>();
    const seenKeys = new Set<string>();

    for (const validation of validations) {
      const key = [
        normalizeName(validation.row.fantasyTeam),
        normalizeName(validation.row.playerName),
      ].join(":");

      if (seenKeys.has(key)) {
        duplicateKeys.add(key);
      }

      seenKeys.add(key);
    }

    const previewRows: LeagueImportPreviewRow[] =
      validations.map((validation) => {
        const errors = [...validation.errors];
        const warnings = [...validation.warnings];

        const normalizedTeamName = normalizeName(
          validation.row.fantasyTeam
        );

        const teamMatches = teams.filter(
          (team) =>
            normalizeName(team.name) ===
            normalizedTeamName
        );

        const team =
          teamMatches.length === 1
            ? teamMatches[0]
            : null;

        if (
          normalizedTeamName &&
          teamMatches.length === 0
        ) {
          errors.push(
            `Fantasy team "${validation.row.fantasyTeam}" was not found.`
          );
        }

        if (teamMatches.length > 1) {
          errors.push(
            `Multiple teams matched "${validation.row.fantasyTeam}".`
          );
        }

        const duplicateKey = [
          normalizedTeamName,
          normalizeName(validation.row.playerName),
        ].join(":");

        if (duplicateKeys.has(duplicateKey)) {
          errors.push(
            "This player appears more than once for the same team in the import file."
          );
        }

        let globalPlayer:
          | {
              id: string;
              display_name: string | null;
              full_name: string | null;
              first_name: string | null;
              last_name: string | null;
              sport: string | null;
              external_id: string | null;
            }
          | null = null;

        if (validation.row.externalPlayerId) {
          globalPlayer =
            globalPlayers?.find(
              (player) =>
                player.external_id ===
                  validation.row.externalPlayerId &&
                player.sport === validation.row.sport
            ) ?? null;
        }

        if (!globalPlayer) {
          const playerMatches = (
            globalPlayers ?? []
          ).filter((player) => {
            const storedName =
              player.display_name ??
              player.full_name ??
              [player.first_name, player.last_name]
                .filter(Boolean)
                .join(" ");

            return (
              normalizeName(storedName ?? "") ===
                normalizeName(validation.row.playerName) &&
              player.sport === validation.row.sport
            );
          });

          if (playerMatches.length > 1) {
            errors.push(
              `Multiple global players matched "${validation.row.playerName}".`
            );
          }

          globalPlayer =
            playerMatches.length === 1
              ? playerMatches[0]
              : null;
        }

        const leaguePlayer = globalPlayer
          ? leaguePlayers?.find(
              (candidate) =>
                candidate.player_id === globalPlayer?.id
            ) ?? null
          : null;

        let matchStatus: LeagueImportMatchStatus;

        if (leaguePlayer) {
          matchStatus = "existing_league_player";

          if (
            team &&
            leaguePlayer.current_team_id &&
            leaguePlayer.current_team_id !== team.id
          ) {
            warnings.push(
              `${validation.row.playerName} is currently assigned to a different fantasy team and will be moved.`
            );
          }
        } else if (globalPlayer) {
          matchStatus = "existing_global_player";
        } else {
          matchStatus = "new_global_player";
        }

        const isValid = errors.length === 0;

        const schedule = isValid
          ? ContractCalculationService.calculateSchedule({
              startingSalary:
                validation.row.startingSalary,
              lengthYears:
                validation.row.contractYears,
              annualInflationRate:
                settings.annualInflationRate,
            })
          : null;

        return {
          row: validation.row,
          isValid,
          errors,
          warnings,

          teamId: team?.id ?? null,
          teamName: team?.name ?? null,

          playerId: globalPlayer?.id ?? null,
          leaguePlayerId:
            leaguePlayer?.id ?? null,

          matchStatus,

          totalValue: schedule?.totalValue ?? 0,

          schedule:
            schedule?.years.map((year) => ({
              yearNumber: year.yearNumber,
              salary: year.salary,
              capHit: year.capHit,
            })) ?? [],
        };
      });

    return {
      totalRows: previewRows.length,
      validRows: previewRows.filter(
        (row) => row.isValid
      ).length,
      invalidRows: previewRows.filter(
        (row) => !row.isValid
      ).length,
      warningRows: previewRows.filter(
        (row) => row.warnings.length > 0
      ).length,
      newGlobalPlayers: previewRows.filter(
        (row) =>
          row.matchStatus === "new_global_player"
      ).length,
      newLeaguePlayers: previewRows.filter(
        (row) =>
          row.matchStatus === "existing_global_player"
      ).length,
      existingLeaguePlayers: previewRows.filter(
        (row) =>
          row.matchStatus ===
          "existing_league_player"
      ).length,
      rows: previewRows,
    };
  },
};
import type { RookieDraftImportRow } from "./rookie-draft-import-parser";

import {
  validateRookieDraftImport,
} from "./rookie-draft-import-validator";

import { createClient } from "@/lib/supabase/server";

import { RookieDraftSetupService } from "@/features/rookie-draft/services/rookie-draft-setup-service";

function normalizeName(
  value: string,
): string {
  return value
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]/g,
      "",
    );
}

export type RookieDraftImportPreviewRow = {
  rowNumber: number;

  round: number;
  roundPick: number;

  overallPick: number | null;

  playerName: string;

  playerId: string | null;

  teamId: string | null;
  teamName: string | null;

  draftPickId: string | null;

  startingSalary: number;
  contractYears: number;

  isValid: boolean;
  errors: string[];
};

export type RookieDraftImportPreview = {
  draftSeasonId: string;
  draftSeasonYear: number;

  totalRows: number;
  validRows: number;
  invalidRows: number;

  rows:
    RookieDraftImportPreviewRow[];
};

export const RookieDraftImportPreviewService = {
  async build(params: {
    leagueId: string;
    rows: RookieDraftImportRow[];
  }): Promise<RookieDraftImportPreview> {
    const setup =
      await RookieDraftSetupService.getSetup({
        leagueId:
          params.leagueId,
      });

    if (!setup.readyToOpen) {
      throw new Error(
        "Complete the rookie draft order before importing results.",
      );
    }

    const supabase =
      await createClient();

    const {
      data: operation,
      error: operationError,
    } =
      await supabase
        .from(
          "league_operation_periods",
        )
        .select(`
          id,
          status
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .eq(
          "season_id",
          setup.operationSeasonId,
        )
        .eq(
          "phase",
          "rookie_draft",
        )
        .maybeSingle();

    if (operationError) {
      throw new Error(
        operationError.message,
      );
    }

    if (
      operation?.status !==
      "open"
    ) {
      throw new Error(
        "The Rookie Draft window must be open before results can be imported.",
      );
    }

    const [
      validations,
      playersResult,
      picksResult,
      teamsResult,
      settingsResult,
    ] = await Promise.all([
      Promise.resolve(
        validateRookieDraftImport(
          params.rows,
        ),
      ),

      supabase
        .from("players")
        .select(`
          id,
          full_name,
          display_name,
          first_name,
          last_name,
          status,
          years_exp,
          fantasy_positions
        `)
        .eq(
          "years_exp",
          0,
        ),

      supabase
        .from("draft_picks")
        .select(`
          id,
          round,
          pick_number,
          original_team_id,
          current_team_id,
          status
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .eq(
          "season_id",
          setup.draftSeasonId,
        ),

      supabase
        .from("teams")
        .select(`
          id,
          name
        `)
        .eq(
          "league_id",
          params.leagueId,
        ),

      supabase
        .from(
          "league_contract_settings",
        )
        .select(`
          rookie_contract_length,
          rookie_round_1_salary,
          rookie_round_2_salary
        `)
        .eq(
          "league_id",
          params.leagueId,
        )
        .single(),
    ]);

    if (playersResult.error) {
      throw new Error(
        playersResult.error.message,
      );
    }

    if (picksResult.error) {
      throw new Error(
        picksResult.error.message,
      );
    }

    if (teamsResult.error) {
      throw new Error(
        teamsResult.error.message,
      );
    }

    if (settingsResult.error) {
      throw new Error(
        settingsResult.error.message,
      );
    }

    const teams =
      new Map(
        (teamsResult.data ?? []).map(
          (team) => [
            team.id,
            team.name,
          ],
        ),
      );

    const teamCount =
      setup.totalPicks /
      Math.max(
        setup.rounds,
        1,
      );

    const previewRows =
      validations.map(
        (validation) => {
          const errors =
            [
              ...validation.errors,
            ];

          const row =
            validation.row;

          const overallPick =
            Number.isInteger(
              row.round,
            ) &&
            Number.isInteger(
              row.roundPick,
            )
              ? (row.round - 1) *
                  teamCount +
                row.roundPick
              : null;

          const draftPick =
            overallPick === null
              ? null
              : (
                  picksResult.data ??
                  []
                ).find(
                  (pick) =>
                    pick.pick_number ===
                    overallPick,
                ) ?? null;

          if (!draftPick) {
            errors.push(
              `Pick ${row.round}.${String(
                row.roundPick,
              ).padStart(
                2,
                "0",
              )} was not found.`,
            );
          } else if (
            draftPick.status !==
            "active"
          ) {
            errors.push(
              "This draft pick has already been used or forfeited.",
            );
          }

          const normalizedPlayer =
            normalizeName(
              row.playerName,
            );

          const matchingPlayers =
            (
              playersResult.data ??
              []
            ).filter(
              (player) => {
                const storedName =
                  player.display_name ??
                  player.full_name ??
                  [
                    player.first_name,
                    player.last_name,
                  ]
                    .filter(
                      Boolean,
                    )
                    .join(" ");

                return (
                  normalizeName(
                    storedName ??
                      "",
                  ) ===
                  normalizedPlayer
                );
              },
            );

          const player =
            matchingPlayers.length ===
            1
              ? matchingPlayers[0]
              : null;

          if (
            matchingPlayers.length ===
            0
          ) {
            errors.push(
              `Rookie "${row.playerName}" was not found.`,
            );
          }

          if (
            matchingPlayers.length >
            1
          ) {
            errors.push(
              `Multiple rookies matched "${row.playerName}".`,
            );
          }

          if (
            player &&
            player.status !==
              "active"
          ) {
            errors.push(
              `${row.playerName} is not an active player.`,
            );
          }

          if (
            player &&
            (!Array.isArray(
              player.fantasy_positions,
            ) ||
              player
                .fantasy_positions
                .length === 0)
          ) {
            errors.push(
              `${row.playerName} is not currently fantasy-eligible.`,
            );
          }

          const startingSalary =
            row.round === 1
              ? Number(
                  settingsResult.data
                    .rookie_round_1_salary,
                )
              : Number(
                  settingsResult.data
                    .rookie_round_2_salary,
                );

          return {
            rowNumber:
              row.rowNumber,

            round:
              row.round,

            roundPick:
              row.roundPick,

            overallPick,

            playerName:
              player?.display_name ??
              player?.full_name ??
              row.playerName,

            playerId:
              player?.id ??
              null,

            teamId:
              draftPick
                ?.current_team_id ??
              null,

            teamName:
              draftPick
                ? teams.get(
                    draftPick.current_team_id,
                  ) ??
                  "Unknown Team"
                : null,

            draftPickId:
              draftPick?.id ??
              null,

            startingSalary,

            contractYears:
              Number(
                settingsResult.data
                  .rookie_contract_length,
              ),

            isValid:
              errors.length === 0,

            errors,
          };
        },
      );

    const validRows =
      previewRows.filter(
        (row) =>
          row.isValid,
      ).length;

    return {
      draftSeasonId:
        setup.draftSeasonId,

      draftSeasonYear:
        setup.draftSeasonYear,

      totalRows:
        previewRows.length,

      validRows,

      invalidRows:
        previewRows.length -
        validRows,

      rows:
        previewRows,
    };
  },
};
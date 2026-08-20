import type { RookieDraftImportRow } from "./rookie-draft-import-parser";

export type RookieDraftImportValidation = {
  row: RookieDraftImportRow;
  isValid: boolean;
  errors: string[];
};

export function validateRookieDraftImport(
  rows: RookieDraftImportRow[],
): RookieDraftImportValidation[] {
  const seenPicks =
    new Set<string>();

  const seenPlayers =
    new Set<string>();

  return rows.map((row) => {
    const errors: string[] = [];

    if (
      !Number.isInteger(row.round) ||
      row.round < 1
    ) {
      errors.push(
        "Draft round is invalid.",
      );
    }

    if (
      !Number.isInteger(row.roundPick) ||
      row.roundPick < 1
    ) {
      errors.push(
        "Draft pick is invalid.",
      );
    }

    if (!row.playerName) {
      errors.push(
        "Player name is required.",
      );
    }

    const pickKey =
      `${row.round}.${row.roundPick}`;

    if (
      seenPicks.has(
        pickKey,
      )
    ) {
      errors.push(
        `Pick ${pickKey} appears more than once.`,
      );
    }

    seenPicks.add(
      pickKey,
    );

    const playerKey =
      row.playerName
        .trim()
        .toLowerCase()
        .replace(
          /[^a-z0-9]/g,
          "",
        );

    if (
      playerKey &&
      seenPlayers.has(
        playerKey,
      )
    ) {
      errors.push(
        `${row.playerName} appears more than once.`,
      );
    }

    if (playerKey) {
      seenPlayers.add(
        playerKey,
      );
    }

    return {
      row,
      isValid:
        errors.length === 0,
      errors,
    };
  });
}
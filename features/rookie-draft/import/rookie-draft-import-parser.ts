export type RookieDraftImportRow = {
  rowNumber: number;
  round: number;
  roundPick: number;
  playerName: string;
};

export function parseRookieDraftImport(
  value: string,
): RookieDraftImportRow[] {
  const lines = value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line, index) => {
    const match = line.match(
      /^(\d+)\.(\d+)\s+(.+)$/,
    );

    if (!match) {
      return {
        rowNumber: index + 1,
        round: Number.NaN,
        roundPick: Number.NaN,
        playerName: line,
      };
    }

    return {
      rowNumber: index + 1,

      round:
        Number(match[1]),

      roundPick:
        Number(match[2]),

      playerName:
        String(match[3] ?? "").trim(),
    };
  });
}
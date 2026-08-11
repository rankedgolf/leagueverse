export type LeagueImportRow = {
  rowNumber: number;

  fantasyTeam: string;

  playerName: string;
  firstName: string | null;
  lastName: string | null;

  position: string | null;
  proTeam: string | null;
  sport: string;

  startingSalary: number;
  contractYears: number;

  externalPlayerId: string | null;
};

type CsvRecord = Record<string, string>;

function cleanOptionalValue(value: unknown): string | null {
  const cleaned = String(value ?? "").trim();

  return cleaned || null;
}

function splitPlayerName(playerName: string): {
  firstName: string | null;
  lastName: string | null;
} {
  const parts = playerName.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return {
      firstName: null,
      lastName: null,
    };
  }

  return {
    firstName: parts[0] ?? null,
    lastName:
      parts.length > 1
        ? parts.slice(1).join(" ")
        : null,
  };
}

export function parseLeagueImport(
  rows: CsvRecord[]
): LeagueImportRow[] {
  return rows.map((row, index) => {
    const playerName = String(
      row.player_name ?? ""
    ).trim();

    const parsedName = splitPlayerName(playerName);

    const suppliedFirstName = cleanOptionalValue(
      row.first_name
    );

    const suppliedLastName = cleanOptionalValue(
      row.last_name
    );

    return {
      rowNumber: index + 2,

      fantasyTeam: String(
        row.fantasy_team ?? ""
      ).trim(),

      playerName,

      firstName:
        suppliedFirstName ?? parsedName.firstName,

      lastName:
        suppliedLastName ?? parsedName.lastName,

      position: cleanOptionalValue(row.position),

      proTeam: cleanOptionalValue(
        row.pro_team
      ),

      sport:
        String(row.sport ?? "football")
          .trim()
          .toLowerCase() || "football",

      startingSalary: Number(
        row.starting_salary
      ),

      contractYears: Number(
        row.contract_years
      ),

      externalPlayerId: cleanOptionalValue(
        row.external_player_id
      ),
    };
  });
}
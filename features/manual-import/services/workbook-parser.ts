import * as XLSX from "xlsx";

export type ManualImportTeam = {
  teamName: string;
  ownerDisplayName: string | null;
  ownerEmail: string | null;
  abbreviation: string | null;
  nickname: string | null;
  primaryColor: string | null;
  secondaryColor: string | null;
};

export type ManualImportRoster = {
  teamName: string;
  playerName: string;
  position: string | null;
  nflTeam: string | null;
  rosterStatus: string | null;
  notes: string | null;
};

export type ManualImportContract = {
  teamName: string;
  playerName: string;
  contractType: string | null;
  yearsRemaining: number | null;
  annualSalary: number | null;
  guaranteedValue: number | null;
  signingBonus: number | null;
  startSeason: number | null;
  endSeason: number | null;
  notes: string | null;
};

export type ManualImportDraftPick = {
  seasonYear: number | null;
  round: number | null;
  originalTeam: string;
  currentTeam: string;
  pickNumber: number | null;
  status: string | null;
  notes: string | null;
};

export type ManualImportLeagueSetup = {
  leagueName: string | null;
  seasonYear: number | null;
  sourcePlatform: string | null;
  salaryCap: number | null;
  maxContractLength: number | null;
  rookieDraftRounds: number | null;
  notes: string | null;
};

export type ManualImportPreview = {
  fileName: string;

  leagueSetup: ManualImportLeagueSetup | null;

  counts: {
    teams: number;
    rosters: number;
    contracts: number;
    draftPicks: number;
  };

  teams: ManualImportTeam[];

  rosters: ManualImportRoster[];

  contracts: ManualImportContract[];

  draftPicks: ManualImportDraftPick[];

  warnings: string[];
};

const REQUIRED_SHEETS = [
  "Teams",
  "Rosters",
];

const TEAM_HEADERS = [
  "Team Name*",
  "Owner Display Name",
  "Owner Email",
  "Abbreviation",
  "Nickname",
  "Primary Color",
  "Secondary Color",
];

const ROSTER_HEADERS = [
  "Team Name*",
  "Player Name*",
  "Position",
  "NFL Team",
  "Roster Status",
  "Notes",
];

const CONTRACT_HEADERS = [
  "Team Name*",
  "Player Name*",
  "Contract Type",
  "Years Remaining*",
  "Annual Salary*",
  "Guaranteed Value",
  "Signing Bonus",
  "Start Season",
  "End Season",
  "Notes",
];

const DRAFT_PICK_HEADERS = [
  "Season Year*",
  "Round*",
  "Original Team*",
  "Current Team*",
  "Pick Number",
  "Status",
  "Notes",
];

function normalizeValue(
  value: unknown,
): string {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value).trim();
}

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

function parseNumber(
  value: unknown,
): number | null {
  const normalized =
    normalizeValue(value)
      .replace(/\$/g, "")
      .replace(/,/g, "");

  if (!normalized) {
    return null;
  }

  const number =
    Number(normalized);

  if (
    !Number.isFinite(number)
  ) {
    return null;
  }

  return number;
}

function parseInteger(
  value: unknown,
): number | null {
  const number =
    parseNumber(value);

  if (
    number === null ||
    !Number.isInteger(number)
  ) {
    return null;
  }

  return number;
}

function getSheetRows(
  workbook: XLSX.WorkBook,
  sheetName: string,
): unknown[][] {
  const worksheet =
    workbook.Sheets[
      sheetName
    ];

  if (!worksheet) {
    return [];
  }

  return XLSX.utils.sheet_to_json<
    unknown[]
  >(worksheet, {
    header: 1,
    defval: "",
    raw: false,
  });
}

function findHeaderRow(
  rows: unknown[][],
  expectedFirstHeader: string,
) {
  return rows.findIndex(
    (row) =>
      normalizeValue(
        row[0],
      ) === expectedFirstHeader,
  );
}

function validateHeaders(params: {
  rows: unknown[][];
  expectedHeaders: string[];
  sheetName: string;
}) {
  const headerIndex =
    findHeaderRow(
      params.rows,
      params.expectedHeaders[0],
    );

  if (
    headerIndex === -1
  ) {
    throw new Error(
      `${params.sheetName} does not contain the expected LeagueVerse header row.`,
    );
  }

  const actualHeaders =
    params.rows[
      headerIndex
    ].map(
      normalizeValue,
    );

  for (
    let index = 0;
    index <
    params.expectedHeaders.length;
    index += 1
  ) {
    if (
      actualHeaders[index] !==
      params.expectedHeaders[index]
    ) {
      throw new Error(
        `${params.sheetName} has an invalid column header. Expected "${params.expectedHeaders[index]}" in column ${
          index + 1
        }.`,
      );
    }
  }

  return headerIndex;
}

function getDataRows(params: {
  rows: unknown[][];
  expectedHeaders: string[];
  sheetName: string;
}) {
  const headerIndex =
    validateHeaders(
      params,
    );

  return params.rows
    .slice(
      headerIndex + 1,
    )
    .filter((row) =>
      row.some(
        (value) =>
          normalizeValue(
            value,
          ) !== "",
      ),
    );
}

function parseLeagueSetup(
  workbook: XLSX.WorkBook,
): ManualImportLeagueSetup | null {
  if (
    !workbook.SheetNames.includes(
      "League Setup",
    )
  ) {
    return null;
  }

  const rows =
    getSheetRows(
      workbook,
      "League Setup",
    );

  const values =
    new Map<
      string,
      unknown
    >();

  for (
    const row of rows
  ) {
    const field =
      normalizeValue(
        row[0],
      );

    if (
      !field ||
      field === "Field"
    ) {
      continue;
    }

    values.set(
      field,
      row[1],
    );
  }

  return {
    leagueName:
      normalizeValue(
        values.get(
          "League Name",
        ),
      ) || null,

    seasonYear:
      parseInteger(
        values.get(
          "Season Year",
        ),
      ),

    sourcePlatform:
      normalizeValue(
        values.get(
          "Source Platform",
        ),
      ) || null,

    salaryCap:
      parseNumber(
        values.get(
          "Salary Cap",
        ),
      ),

    maxContractLength:
      parseInteger(
        values.get(
          "Max Contract Length",
        ),
      ),

    rookieDraftRounds:
      parseInteger(
        values.get(
          "Rookie Draft Rounds",
        ),
      ),

    notes:
      normalizeValue(
        values.get(
          "Notes",
        ),
      ) || null,
  };
}

export function parseManualImportWorkbook(params: {
  buffer: ArrayBuffer;
  fileName: string;
}): ManualImportPreview {
  const workbook =
    XLSX.read(
      params.buffer,
      {
        type: "array",
      },
    );

  for (
    const sheetName of
    REQUIRED_SHEETS
  ) {
    if (
      !workbook.SheetNames.includes(
        sheetName,
      )
    ) {
      throw new Error(
        `The workbook is missing the required "${sheetName}" sheet.`,
      );
    }
  }

  const leagueSetup =
    parseLeagueSetup(
      workbook,
    );

  const teamRows =
    getDataRows({
      rows: getSheetRows(
        workbook,
        "Teams",
      ),
      expectedHeaders:
        TEAM_HEADERS,
      sheetName:
        "Teams",
    });

  const rosterRows =
    getDataRows({
      rows: getSheetRows(
        workbook,
        "Rosters",
      ),
      expectedHeaders:
        ROSTER_HEADERS,
      sheetName:
        "Rosters",
    });

  const contractRows =
    workbook.SheetNames.includes(
      "Contracts",
    )
      ? getDataRows({
          rows: getSheetRows(
            workbook,
            "Contracts",
          ),
          expectedHeaders:
            CONTRACT_HEADERS,
          sheetName:
            "Contracts",
        })
      : [];

  const draftPickRows =
    workbook.SheetNames.includes(
      "Draft Picks",
    )
      ? getDataRows({
          rows: getSheetRows(
            workbook,
            "Draft Picks",
          ),
          expectedHeaders:
            DRAFT_PICK_HEADERS,
          sheetName:
            "Draft Picks",
        })
      : [];

  const warnings: string[] =
    [];

  const teams: ManualImportTeam[] =
    teamRows
      .map((row) => ({
        teamName:
          normalizeValue(
            row[0],
          ),

        ownerDisplayName:
          normalizeValue(
            row[1],
          ) || null,

        ownerEmail:
          normalizeValue(
            row[2],
          ) || null,

        abbreviation:
          normalizeValue(
            row[3],
          ) || null,

        nickname:
          normalizeValue(
            row[4],
          ) || null,

        primaryColor:
          normalizeValue(
            row[5],
          ) || null,

        secondaryColor:
          normalizeValue(
            row[6],
          ) || null,
      }))
      .filter(
        (team) =>
          team.teamName !==
          "",
      );

  const normalizedTeamNames =
    teams.map(
      (team) =>
        normalizeName(
          team.teamName,
        ),
    );

  const duplicateTeamNames =
    teams
      .filter(
        (
          team,
          index,
        ) =>
          normalizedTeamNames.indexOf(
            normalizeName(
              team.teamName,
            ),
          ) !== index,
      )
      .map(
        (team) =>
          team.teamName,
      );

  if (
    duplicateTeamNames.length >
    0
  ) {
    warnings.push(
      `Duplicate team names found: ${[
        ...new Set(
          duplicateTeamNames,
        ),
      ].join(", ")}`,
    );
  }

  const knownTeamNames =
    new Set(
      teams.map(
        (team) =>
          normalizeName(
            team.teamName,
          ),
      ),
    );

  const rosters: ManualImportRoster[] =
    rosterRows
      .map((row) => ({
        teamName:
          normalizeValue(
            row[0],
          ),

        playerName:
          normalizeValue(
            row[1],
          ),

        position:
          normalizeValue(
            row[2],
          ) || null,

        nflTeam:
          normalizeValue(
            row[3],
          ) || null,

        rosterStatus:
          normalizeValue(
            row[4],
          ) || null,

        notes:
          normalizeValue(
            row[5],
          ) || null,
      }))
      .filter(
        (row) =>
          row.teamName !==
            "" ||
          row.playerName !==
            "",
      );

  const contracts: ManualImportContract[] =
    contractRows
      .map((row) => ({
        teamName:
          normalizeValue(
            row[0],
          ),

        playerName:
          normalizeValue(
            row[1],
          ),

        contractType:
          normalizeValue(
            row[2],
          ) || null,

        yearsRemaining:
          parseInteger(
            row[3],
          ),

        annualSalary:
          parseNumber(
            row[4],
          ),

        guaranteedValue:
          parseNumber(
            row[5],
          ),

        signingBonus:
          parseNumber(
            row[6],
          ),

        startSeason:
          parseInteger(
            row[7],
          ),

        endSeason:
          parseInteger(
            row[8],
          ),

        notes:
          normalizeValue(
            row[9],
          ) || null,
      }))
      .filter(
        (row) =>
          row.teamName !==
            "" ||
          row.playerName !==
            "",
      );

  const draftPicks: ManualImportDraftPick[] =
    draftPickRows
      .map((row) => ({
        seasonYear:
          parseInteger(
            row[0],
          ),

        round:
          parseInteger(
            row[1],
          ),

        originalTeam:
          normalizeValue(
            row[2],
          ),

        currentTeam:
          normalizeValue(
            row[3],
          ),

        pickNumber:
          parseInteger(
            row[4],
          ),

        status:
          normalizeValue(
            row[5],
          ) || null,

        notes:
          normalizeValue(
            row[6],
          ) || null,
      }))
      .filter(
        (row) =>
          row.seasonYear !==
            null ||
          row.round !==
            null ||
          row.originalTeam !==
            "" ||
          row.currentTeam !==
            "",
      );

  /*
   * ------------------------------------------------------------
   * ROSTER VALIDATION
   * ------------------------------------------------------------
   */

  for (
    const roster of rosters
  ) {
    if (
      !roster.teamName
    ) {
      warnings.push(
        `Roster row for "${roster.playerName || "Unknown Player"}" is missing a team name.`,
      );

      continue;
    }

    if (
      !knownTeamNames.has(
        normalizeName(
          roster.teamName,
        ),
      )
    ) {
      warnings.push(
        `Roster team "${roster.teamName}" does not match a team in the Teams sheet.`,
      );
    }

    if (
      !roster.playerName
    ) {
      warnings.push(
        `A roster row for ${roster.teamName} is missing a player name.`,
      );
    }
  }

  /*
   * ------------------------------------------------------------
   * CONTRACT VALIDATION
   * ------------------------------------------------------------
   */

  const rosterKeys =
    new Set(
      rosters.map(
        (roster) =>
          [
            normalizeName(
              roster.teamName,
            ),
            normalizeName(
              roster.playerName,
            ),
          ].join(":"),
      ),
    );

  for (
    const contract of
    contracts
  ) {
    const contractKey =
      [
        normalizeName(
          contract.teamName,
        ),
        normalizeName(
          contract.playerName,
        ),
      ].join(":");

    if (
      !knownTeamNames.has(
        normalizeName(
          contract.teamName,
        ),
      )
    ) {
      warnings.push(
        `Contract team "${contract.teamName}" does not match a team in the Teams sheet.`,
      );
    }

    if (
      !rosterKeys.has(
        contractKey,
      )
    ) {
      warnings.push(
        `Contract player "${contract.playerName}" is not listed on ${contract.teamName}'s roster.`,
      );
    }

    if (
      contract.yearsRemaining ===
        null ||
      contract.yearsRemaining <
        1
    ) {
      warnings.push(
        `Contract for "${contract.playerName}" must have at least 1 year remaining.`,
      );
    }

    if (
      contract.annualSalary ===
        null ||
      contract.annualSalary <
        0
    ) {
      warnings.push(
        `Contract for "${contract.playerName}" has an invalid annual salary.`,
      );
    }
  }

  /*
   * ------------------------------------------------------------
   * DRAFT PICK VALIDATION
   * ------------------------------------------------------------
   */

  for (
    const pick of draftPicks
  ) {
    if (
      !knownTeamNames.has(
        normalizeName(
          pick.originalTeam,
        ),
      )
    ) {
      warnings.push(
        `Draft pick original team "${pick.originalTeam}" does not match a team in the Teams sheet.`,
      );
    }

    if (
      !knownTeamNames.has(
        normalizeName(
          pick.currentTeam,
        ),
      )
    ) {
      warnings.push(
        `Draft pick current team "${pick.currentTeam}" does not match a team in the Teams sheet.`,
      );
    }

    if (
      pick.seasonYear ===
      null
    ) {
      warnings.push(
        "A draft pick is missing its season year.",
      );
    }

    if (
      pick.round === null ||
      pick.round < 1
    ) {
      warnings.push(
        "A draft pick has an invalid round.",
      );
    }
  }

  if (
    teams.length ===
    0
  ) {
    warnings.push(
      "No teams were found in the Teams sheet.",
    );
  }

  if (
    rosters.length ===
    0
  ) {
    warnings.push(
      "No roster players were found in the Rosters sheet.",
    );
  }

  return {
    fileName:
      params.fileName,

    leagueSetup,

    counts: {
      teams:
        teams.length,

      rosters:
        rosters.length,

      contracts:
        contracts.length,

      draftPicks:
        draftPicks.length,
    },

    /*
     * Keep the complete workbook data.
     *
     * The UI can choose to display only the first 10 rows,
     * but the eventual import action needs every row.
     */
    teams,

    rosters,

    contracts,

    draftPicks,

    warnings:
      Array.from(
        new Set(
          warnings,
        ),
      ).slice(
        0,
        50,
      ),
  };
}
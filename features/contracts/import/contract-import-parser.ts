export type ContractImportRow = {
  rowNumber: number;

  fantasyTeam: string;

  playerName: string;

  startingSalary: number;

  contractYears: number;
};

export function parseContractImport(
  rows: Record<string, string>[]
): ContractImportRow[] {
  return rows.map((row, index) => ({
    rowNumber: index + 2,

    fantasyTeam: String(row["fantasy_team"] ?? "").trim(),

    playerName: String(row["player_name"] ?? "").trim(),

    startingSalary: Number(row["starting_salary"]),

    contractYears: Number(row["contract_years"]),
  }));
}
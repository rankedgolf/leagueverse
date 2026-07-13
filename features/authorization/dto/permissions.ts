export const Permissions = {
  ManageLeague: "manage_league",
  ManageMembers: "manage_members",
  ManagePlayers: "manage_players",
  ManageRosters: "manage_rosters",
  ManageContracts: "manage_contracts",
  ManageSalaryCap: "manage_salary_cap",
  ManageDraft: "manage_draft",
  ManageTransactions: "manage_transactions",
} as const;

export type Permission =
  (typeof Permissions)[keyof typeof Permissions];
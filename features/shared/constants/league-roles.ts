export const LeagueRoles = {
  COMMISSIONER: "commissioner",
  CO_COMMISSIONER: "co_commissioner",
  TEAM_OWNER: "team_owner",
  VIEWER: "viewer",
} as const;

export type LeagueRole =
  (typeof LeagueRoles)[keyof typeof LeagueRoles];
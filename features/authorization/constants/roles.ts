export const Roles = {
  Commissioner: "commissioner",
  CoCommissioner: "co_commissioner",
  Owner: "owner",
  Member: "member",
  Viewer: "viewer",
} as const;

export type Role = (typeof Roles)[keyof typeof Roles];
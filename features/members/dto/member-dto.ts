export type LeagueMemberDTO = {
  id: string;
  role: string;
  status: string;
  user: {
    id: string;
    email: string | null;
    displayName: string | null;
  };
  team: {
    id: string;
    name: string;
    abbreviation: string | null;
  } | null;
};
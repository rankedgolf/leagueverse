export type SleeperLeague = {
  league_id: string;
  name: string;
  sport: string;
  season: string;
  season_type: string;
  status: string;
  total_rosters: number;
  draft_id: string | null;
  previous_league_id: string | null;
  avatar: string | null;
  roster_positions: string[];
  settings: Record<string, number | string | boolean | null>;
  scoring_settings: Record<string, number>;
};

export type SleeperUser = {
  user_id: string;
  username: string | null;
  display_name: string;
  avatar: string | null;
  is_owner?: boolean;
  metadata?: {
    team_name?: string;
    [key: string]: string | undefined;
  };
};

export type SleeperRoster = {
  roster_id: number;
  owner_id: string | null;
  league_id: string;
  players: string[] | null;
  starters: string[] | null;
  reserve?: string[] | null;
  taxi?: string[] | null;
  settings: Record<string, number | null>;
};

export type SleeperDraft = {
  draft_id: string;
  league_id: string;
  type: string;
  status: string;
  sport: string;
  season: string;
  season_type: string;
  start_time: number | null;
  created: number;
  last_picked: number | null;
  draft_order: Record<string, number> | null;
  slot_to_roster_id: Record<string, number> | null;
  settings: Record<string, number | string | boolean | null>;
  metadata: Record<string, string | null>;
};

export type SleeperDraftPick = {
  player_id: string;
  picked_by: string;
  roster_id: string;
  round: number;
  draft_slot: number;
  pick_no: number;
  is_keeper: boolean | null;
  draft_id: string;
  metadata: {
    first_name?: string;
    last_name?: string;
    position?: string;
    team?: string;
    amount?: string;
    [key: string]: string | undefined;
  };
};

export type SleeperPlayer = {
  player_id: string;

  first_name: string | null;
  last_name: string | null;
  full_name: string | null;

  position: string | null;
  fantasy_positions?: string[] | null;

  team: string | null;
  status: string | null;

  active?: boolean | null;

  age?: number | null;
  years_exp?: number | null;

  search_rank?: number | null;
  depth_chart_order?: number | null;
};
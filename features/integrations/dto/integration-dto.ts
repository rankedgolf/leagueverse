export type IntegrationProvider =
  | "manual"
  | "sleeper"
  | "yahoo"
  | "espn";

export type LeagueIntegrationDTO = {
  id: string;
  leagueId: string;
  provider: IntegrationProvider;
  externalLeagueId: string;
  externalDraftId: string | null;
  isConnected: boolean;
  lastSyncAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ConnectLeagueIntegrationInput = {
  leagueId: string;
  provider: Exclude<IntegrationProvider, "manual">;
  externalLeagueId: string;
  externalDraftId: string | null;
};

export type LeagueIntegrationRow = {
  id: string;
  league_id: string;
  provider: string;
  external_league_id: string;
  external_draft_id: string | null;
  is_connected: boolean;
  last_sync_at: string | null;
  created_at: string;
  updated_at: string;
};

export function mapLeagueIntegrationRow(
  row: LeagueIntegrationRow,
): LeagueIntegrationDTO {
  return {
    id: row.id,
    leagueId: row.league_id,
    provider: row.provider as IntegrationProvider,
    externalLeagueId: row.external_league_id,
    externalDraftId: row.external_draft_id,
    isConnected: row.is_connected,
    lastSyncAt: row.last_sync_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
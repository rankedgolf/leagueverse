import { createClient } from "@/lib/supabase/server";

import {
  mapLeagueIntegrationRow,
  type ConnectLeagueIntegrationInput,
  type LeagueIntegrationDTO,
  type LeagueIntegrationRow,
} from "@/features/integrations/dto/integration-dto";

export const IntegrationRepository = {
  async getByLeague(
    leagueId: string
  ): Promise<LeagueIntegrationDTO[]> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("league_integrations")
      .select(`
        id,
        league_id,
        provider,
        external_league_id,
        external_draft_id,
        is_connected,
        last_sync_at,
        created_at,
        updated_at
      `)
      .eq("league_id", leagueId)
      .order("created_at", {
        ascending: true,
      });

    if (error) {
      throw new Error(error.message);
    }

    return ((data ?? []) as LeagueIntegrationRow[]).map(
      mapLeagueIntegrationRow
    );
  },

  async getByLeagueAndProvider(
    leagueId: string,
    provider: string
  ): Promise<LeagueIntegrationDTO | null> {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("league_integrations")
      .select(`
        id,
        league_id,
        provider,
        external_league_id,
        external_draft_id,
        is_connected,
        last_sync_at,
        created_at,
        updated_at
      `)
      .eq("league_id", leagueId)
      .eq("provider", provider)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return null;
    }

    return mapLeagueIntegrationRow(
      data as LeagueIntegrationRow
    );
  },

  async connect(
    input: ConnectLeagueIntegrationInput
  ): Promise<LeagueIntegrationDTO> {
    const supabase = await createClient();

    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("league_integrations")
      .upsert(
        {
          league_id: input.leagueId,
          provider: input.provider,
          external_league_id: input.externalLeagueId,
          external_draft_id: input.externalDraftId,
          is_connected: true,
          updated_at: now,
        },
        {
          onConflict: "league_id,provider",
        }
      )
      .select(`
        id,
        league_id,
        provider,
        external_league_id,
        external_draft_id,
        is_connected,
        last_sync_at,
        created_at,
        updated_at
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return mapLeagueIntegrationRow(
      data as LeagueIntegrationRow
    );
  },

  async disconnect(
    leagueId: string,
    provider: string
  ): Promise<void> {
    const supabase = await createClient();

    const { error } = await supabase
      .from("league_integrations")
      .update({
        is_connected: false,
        updated_at: new Date().toISOString(),
      })
      .eq("league_id", leagueId)
      .eq("provider", provider);

    if (error) {
      throw new Error(error.message);
    }
  },

  async updateLastSync(
    leagueId: string,
    provider: string
  ): Promise<void> {
    const supabase = await createClient();

    const now = new Date().toISOString();

    const { error } = await supabase
      .from("league_integrations")
      .update({
        last_sync_at: now,
        updated_at: now,
      })
      .eq("league_id", leagueId)
      .eq("provider", provider);

    if (error) {
      throw new Error(error.message);
    }
  },
};
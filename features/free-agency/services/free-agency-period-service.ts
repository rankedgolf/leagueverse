import { createClient } from "@/lib/supabase/server";

export type FreeAgencyPeriodStatus =
  | "scheduled"
  | "open"
  | "paused"
  | "decision_period"
  | "closed"
  | "completed"
  | "cancelled";

export const FreeAgencyPeriodService = {
  async getCurrentPeriod(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("free_agency_periods")
      .select(`
        id,
        league_id,
        season_id,
        name,
        status,
        opens_at,
        closes_at,
        decisions_begin_at,
        decisions_end_at,
        decision_frequency_hours,
        last_decision_at,
        next_decision_at,
        created_at,
        updated_at
      `)
      .eq("league_id", leagueId)
      .in("status", ["scheduled", "open", "paused"])
      .order("opens_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message);
    }

    return data ?? null;
  },

  async updateStatus(params: {
    leagueId: string;
    periodId: string;
    status: FreeAgencyPeriodStatus;
  }) {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const updates: {
      status: FreeAgencyPeriodStatus;
      updated_at: string;
      next_decision_at?: string | null;
      closes_at?: string;
    } = {
      status: params.status,
      updated_at: now,
    };

    if (params.status === "open") {
      const { data: existing, error: existingError } = await supabase
        .from("free_agency_periods")
        .select("decisions_begin_at, next_decision_at")
        .eq("id", params.periodId)
        .eq("league_id", params.leagueId)
        .maybeSingle();

      if (existingError) {
        throw new Error(existingError.message);
      }

      if (!existing) {
        throw new Error("Free Agency period could not be found.");
      }

      if (!existing.next_decision_at && existing.decisions_begin_at) {
        updates.next_decision_at = existing.decisions_begin_at;
      }
    }

    if (params.status === "closed") {
      updates.closes_at = now;
      updates.next_decision_at = null;
    }

    const { data, error } = await supabase
      .from("free_agency_periods")
      .update(updates)
      .eq("id", params.periodId)
      .eq("league_id", params.leagueId)
      .select(`
        id,
        league_id,
        season_id,
        name,
        status,
        opens_at,
        closes_at,
        decisions_begin_at,
        decisions_end_at,
        decision_frequency_hours,
        last_decision_at,
        next_decision_at
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async updateDecisionFrequency(params: {
    leagueId: string;
    periodId: string;
    frequencyHours: number;
  }) {
    if (
      !Number.isInteger(params.frequencyHours) ||
      params.frequencyHours < 1 ||
      params.frequencyHours > 168
    ) {
      throw new Error(
        "Decision frequency must be between 1 and 168 hours.",
      );
    }

    const supabase = await createClient();
    const now = new Date();

    const nextDecisionAt = new Date(
      now.getTime() +
        params.frequencyHours * 60 * 60 * 1000,
    );

    const { data, error } = await supabase
      .from("free_agency_periods")
      .update({
        decision_frequency_hours: params.frequencyHours,
        next_decision_at: nextDecisionAt.toISOString(),
        updated_at: now.toISOString(),
      })
      .eq("id", params.periodId)
      .eq("league_id", params.leagueId)
      .select(`
        id,
        decision_frequency_hours,
        next_decision_at
      `)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },
};
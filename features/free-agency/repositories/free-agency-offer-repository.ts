import { createClient } from "@/lib/supabase/server";

export type SalaryStructureYear = {
  seasonId: string;
  seasonYear: number;
  salary: number;
  bonus: number;
};

type OfferTermsInput = {
  contractYears: number;
  totalValue: number;
  guaranteedValue: number;
  signingBonus: number;
  yearOneSalary: number;
  salaryStructure: SalaryStructureYear[];
};

type CreateOfferInput = OfferTermsInput & {
  leagueId: string;
  seasonId: string;
  freeAgencyPeriodId: string;
  leaguePlayerId: string;
  teamId: string;
  submittedBy: string;
};

type UpdateOfferInput = OfferTermsInput & {
  offerId: string;
  teamId: string;
};

export const FreeAgencyOfferRepository = {
  async getOpenPeriod(leagueId: string) {
    const supabase = await createClient();
    const now = new Date().toISOString();

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
  next_decision_at
`)
      .eq("league_id", leagueId)
      .eq("status", "open")
      .lte("opens_at", now)
      .gte("closes_at", now)
      .order("opens_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ?? null;
  },

  async getFreeAgent(params: {
    leagueId: string;
    leaguePlayerId: string;
  }) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("league_players")
      .select(`
        id,
        league_id,
        player_id,
        status,
        current_team_id,
        players (
          id,
          display_name,
          full_name,
          position,
          pro_team
        )
      `)
      .eq("league_id", params.leagueId)
      .eq("id", params.leaguePlayerId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ?? null;
  },

  async getLeagueSeasons(leagueId: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("seasons")
      .select("id, name, year, is_active")
      .eq("league_id", leagueId)
      .order("year", { ascending: true });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async getExistingActiveOffer(params: {
    freeAgencyPeriodId: string;
    leaguePlayerId: string;
    teamId: string;
  }) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("free_agency_offers")
      .select("id, status")
      .eq("free_agency_period_id", params.freeAgencyPeriodId)
      .eq("league_player_id", params.leaguePlayerId)
      .eq("team_id", params.teamId)
      .eq("status", "active")
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ?? null;
  },

  async getById(params: {
    leagueId: string;
    offerId: string;
  }) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("free_agency_offers")
      .select(`
        id,
        league_id,
        season_id,
        free_agency_period_id,
        league_player_id,
        team_id,
        status,
        contract_years,
        total_value,
        guaranteed_value,
        signing_bonus,
        year_one_salary,
        salary_structure,
        submitted_by,
        submitted_at,
        withdrawn_at,
        decided_at
      `)
      .eq("league_id", params.leagueId)
      .eq("id", params.offerId)
      .maybeSingle();

    if (error) throw new Error(error.message);
    return data ?? null;
  },

  async getActiveByTeam(params: {
    leagueId: string;
    teamId: string;
  }) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("free_agency_offers")
      .select(`
        id,
        league_id,
        season_id,
        free_agency_period_id,
        league_player_id,
        team_id,
        status,
        contract_years,
        total_value,
        guaranteed_value,
        signing_bonus,
        year_one_salary,
        salary_structure,
        submitted_at,
        league_players (
          id,
          player_id,
          players (
            id,
            display_name,
            full_name,
            position,
            pro_team
          )
        )
      `)
      .eq("league_id", params.leagueId)
      .eq("team_id", params.teamId)
      .eq("status", "active")
      .order("submitted_at", { ascending: false });

    if (error) throw new Error(error.message);
    return data ?? [];
  },

  async create(input: CreateOfferInput) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("free_agency_offers")
      .insert({
        league_id: input.leagueId,
        season_id: input.seasonId,
        free_agency_period_id: input.freeAgencyPeriodId,
        league_player_id: input.leaguePlayerId,
        team_id: input.teamId,
        status: "active",
        contract_years: input.contractYears,
        total_value: input.totalValue,
        guaranteed_value: input.guaranteedValue,
        signing_bonus: input.signingBonus,
        year_one_salary: input.yearOneSalary,
        salary_structure: input.salaryStructure,
        submitted_by: input.submittedBy,
        submitted_at: new Date().toISOString(),
        decision_metadata: {},
        updated_at: new Date().toISOString(),
      })
      .select(`
        id,
        league_id,
        season_id,
        free_agency_period_id,
        league_player_id,
        team_id,
        status,
        contract_years,
        total_value,
        guaranteed_value,
        signing_bonus,
        year_one_salary,
        salary_structure,
        submitted_at
      `)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async updateActive(input: UpdateOfferInput) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("free_agency_offers")
      .update({
        contract_years: input.contractYears,
        total_value: input.totalValue,
        guaranteed_value: input.guaranteedValue,
        signing_bonus: input.signingBonus,
        year_one_salary: input.yearOneSalary,
        salary_structure: input.salaryStructure,
        decision_score: null,
        decision_rank: null,
        decision_metadata: {},
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.offerId)
      .eq("team_id", input.teamId)
      .eq("status", "active")
      .select(`
        id,
        status,
        contract_years,
        total_value,
        guaranteed_value,
        signing_bonus,
        year_one_salary,
        salary_structure,
        submitted_at,
        updated_at
      `)
      .single();

    if (error) throw new Error(error.message);
    return data;
  },

  async withdrawActive(params: {
    offerId: string;
    teamId: string;
  }) {
    const supabase = await createClient();
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("free_agency_offers")
      .update({
        status: "withdrawn",
        withdrawn_at: now,
        updated_at: now,
      })
      .eq("id", params.offerId)
      .eq("team_id", params.teamId)
      .eq("status", "active")
      .select("id, status, withdrawn_at")
      .single();

    if (error) throw new Error(error.message);
    return data;
  },
};
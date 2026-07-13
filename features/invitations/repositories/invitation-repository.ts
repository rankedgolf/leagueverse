import { createClient } from "@/lib/supabase/server";

export const InvitationRepository = {
  async create(input: {
    leagueId: string;
    email: string;
    role: string;
    token: string;
    invitedBy: string;
    expiresAt: string;
  }) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("league_invitations")
      .insert({
        league_id: input.leagueId,
        email: input.email,
        role: input.role,
        token: input.token,
        invited_by: input.invitedBy,
        expires_at: input.expiresAt,
      })
      .select("id,token,email,role,status")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async getByToken(token: string) {
    const supabase = await createClient();

    const { data, error } = await supabase
      .from("league_invitations")
      .select(
        `
        id,
        league_id,
        email,
        role,
        token,
        status,
        expires_at,
        leagues (
          id,
          name
        )
      `
      )
      .eq("token", token)
      .single();

    if (error) {
      return null;
    }

    return data;
  },

  async accept(input: {
    invitationId: string;
    leagueId: string;
    userId: string;
    role: string;
  }) {
    const supabase = await createClient();

    const { error: memberError } = await supabase
      .from("league_members")
      .upsert(
        {
          league_id: input.leagueId,
          user_id: input.userId,
          role: input.role,
          status: "active",
        },
        {
          onConflict: "league_id,user_id",
        }
      );

    if (memberError) {
      throw new Error(memberError.message);
    }

    const { error: inviteError } = await supabase
      .from("league_invitations")
      .update({
        status: "accepted",
        accepted_by: input.userId,
        accepted_at: new Date().toISOString(),
      })
      .eq("id", input.invitationId);

    if (inviteError) {
      throw new Error(inviteError.message);
    }
  },

  async getByLeague(leagueId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("league_invitations")
    .select("id,email,role,status,token,created_at,expires_at")
    .eq("league_id", leagueId)
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
},
};
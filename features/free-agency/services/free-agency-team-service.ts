import { createClient } from "@/lib/supabase/server";

type ResolveOwnedTeamInput = {
  leagueId: string;
  userId: string;
};

export const FreeAgencyTeamService = {
  async findOwnedTeam(input: ResolveOwnedTeamInput) {
    const supabase = await createClient();

    const { data: member, error: memberError } = await supabase
      .from("league_members")
      .select("id, league_id, user_id, role, status")
      .eq("league_id", input.leagueId)
      .eq("user_id", input.userId)
      .eq("status", "active")
      .maybeSingle();

    if (memberError) {
      throw new Error(memberError.message);
    }

    if (!member) {
      return null;
    }

    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, league_id, name, owner_member_id")
      .eq("league_id", input.leagueId)
      .eq("owner_member_id", member.id)
      .maybeSingle();

    if (teamError) {
      throw new Error(teamError.message);
    }

    if (!team) {
      return null;
    }

    return {
      memberId: member.id,
      memberRole: member.role,
      teamId: team.id,
      teamName: team.name,
    };
  },

  async resolveOwnedTeam(input: ResolveOwnedTeamInput) {
    const team = await this.findOwnedTeam(input);

    if (!team) {
      throw new Error(
        "You do not currently control a team in this league.",
      );
    }

    return team;
  },
};
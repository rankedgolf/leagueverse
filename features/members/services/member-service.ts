import type { LeagueMemberDTO } from "../dto/member-dto";
import { MemberRepository } from "../repositories/member-repository";

export const MemberService = {
  async getLeagueMembers(leagueId: string): Promise<LeagueMemberDTO[]> {
    const members = await MemberRepository.getByLeague(leagueId);

    return members.map((member) => {
      const profile = Array.isArray(member.profiles)
        ? member.profiles[0]
        : member.profiles;

      const team = Array.isArray(member.teams)
        ? member.teams[0]
        : member.teams;

      return {
        id: member.id,
        role: member.role,
        status: member.status,
        user: {
          id: profile?.id ?? "",
          email: profile?.email ?? null,
          displayName: profile?.display_name ?? null,
        },
        team: team
          ? {
              id: team.id,
              name: team.name,
              abbreviation: team.abbreviation,
            }
          : null,
      };
    });
  },
};
import crypto from "crypto";
import { InvitationRepository } from "../repositories/invitation-repository";

export const InvitationService = {
  async createInvitation(input: {
    leagueId: string;
    email: string;
    role: string;
    invitedBy: string;
  }) {
    const token = crypto.randomBytes(24).toString("hex");

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14);

    return await InvitationRepository.create({
      leagueId: input.leagueId,
      email: input.email,
      role: input.role,
      token,
      invitedBy: input.invitedBy,
      expiresAt: expiresAt.toISOString(),
    });
  },

  async getInvitation(token: string) {
    return await InvitationRepository.getByToken(token);
  },

  async acceptInvitation(input: {
    invitationId: string;
    leagueId: string;
    userId: string;
    role: string;
  }) {
    await InvitationRepository.accept(input);
  },

  async getLeagueInvitations(leagueId: string) {
  return await InvitationRepository.getByLeague(leagueId);
},
};
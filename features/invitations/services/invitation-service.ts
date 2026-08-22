import crypto from "crypto";

import { createClient } from "@/lib/supabase/server";

import { InvitationRepository } from "../repositories/invitation-repository";

import { InvitationEmailService } from "@/features/invitations/services/invitation-email-service";

export const InvitationService = {
  async createInvitation(input: {
    leagueId: string;
    email: string;
    role: string;
    invitedBy: string;
  }) {
    const token =
      crypto.randomBytes(24).toString("hex");

    const expiresAt =
      new Date();

    expiresAt.setDate(
      expiresAt.getDate() + 14,
    );

    const invitation =
      await InvitationRepository.create({
        leagueId:
          input.leagueId,
        email:
          input.email,
        role:
          input.role,
        token,
        invitedBy:
          input.invitedBy,
        expiresAt:
          expiresAt.toISOString(),
      });

    const supabase =
      await createClient();

    const {
      data: league,
      error,
    } =
      await supabase
        .from("leagues")
        .select("name")
        .eq(
          "id",
          input.leagueId,
        )
        .single();

    if (error || !league) {
      throw new Error(
        "Unable to load league information for invitation email.",
      );
    }

    await InvitationEmailService.sendInvitation({
      email:
        invitation.email,
      leagueName:
        league.name,
      token:
        invitation.token,
    });

    return invitation;
  },

  async getInvitation(
    token: string,
  ) {
    return await InvitationRepository.getByToken(
      token,
    );
  },

  async acceptInvitation(input: {
    invitationId: string;
    leagueId: string;
    userId: string;
    role: string;
  }) {
    await InvitationRepository.accept(
      input,
    );
  },

  async getLeagueInvitations(
    leagueId: string,
  ) {
    return await InvitationRepository.getByLeague(
      leagueId,
    );
  },
};
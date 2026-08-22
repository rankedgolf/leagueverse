import { getResend } from "@/lib/email/resend";

export const InvitationEmailService = {
  async sendInvitation(input: {
    email: string;
    leagueName: string;
    token: string;
  }) {
    const resend = getResend();

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL;

    if (!siteUrl) {
      throw new Error(
        "NEXT_PUBLIC_SITE_URL is not configured.",
      );
    }

    const inviteUrl =
      `${siteUrl}/invite/${input.token}`;

    const { error } =
      await resend.emails.send({
        from:
          "LeagueVerse <noreply@playleagueverse.com>",
        to: input.email,
        subject:
          `You're invited to join ${input.leagueName} on LeagueVerse`,
        html: `
          <div style="
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            color: #0f172a;
          ">
            <h1>You're Invited!</h1>

            <p>
              You've been invited to join
              <strong>${input.leagueName}</strong>
              on LeagueVerse.
            </p>

            <p>
              LeagueVerse turns dynasty fantasy football
              into a true front-office experience with
              contracts, salary caps, free agency,
              draft capital, and more.
            </p>

            <p style="margin: 32px 0;">
              <a
                href="${inviteUrl}"
                style="
                  display: inline-block;
                  padding: 14px 22px;
                  background: #6d28d9;
                  color: #ffffff;
                  text-decoration: none;
                  border-radius: 8px;
                  font-weight: 700;
                "
              >
                Accept Invitation
              </a>
            </p>

            <p style="
              color: #64748b;
              font-size: 14px;
            ">
              This invitation expires in 14 days.
            </p>

            <p style="
              color: #64748b;
              font-size: 14px;
            ">
              If you weren't expecting this invitation,
              you can safely ignore this email.
            </p>
          </div>
        `,
      });

    if (error) {
      throw new Error(
        `Failed to send invitation email: ${error.message}`,
      );
    }
  },
};

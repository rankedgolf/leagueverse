import { NextResponse } from "next/server";

import { IntegrationService } from "@/features/integrations/services/integration-service";

type PreviewRequestBody = {
  leagueUrlOrId?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as PreviewRequestBody;

    const leagueUrlOrId = body.leagueUrlOrId?.trim();

    if (!leagueUrlOrId) {
      return NextResponse.json(
        {
          error: "Sleeper league URL or ID is required.",
        },
        {
          status: 400,
        },
      );
    }

    const preview = await IntegrationService.previewLeague(
      "sleeper",
      leagueUrlOrId,
    );

    return NextResponse.json({
      data: preview,
    });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unable to preview the Sleeper league.";

    console.error("Sleeper preview failed:", error);

    return NextResponse.json(
      {
        error: message,
      },
      {
        status: 400,
      },
    );
  }
}
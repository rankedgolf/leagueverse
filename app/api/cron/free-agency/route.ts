import { NextRequest, NextResponse } from "next/server";

import { FreeAgencyCronService } from "@/features/free-agency/services/free-agency-cron-service";

export async function GET(
  request: NextRequest,
) {
  const cronSecret =
    process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "CRON_SECRET is not configured.",
      },
      {
        status: 500,
      },
    );
  }

  const authorization =
    request.headers.get(
      "authorization",
    );

  if (
    authorization !==
    `Bearer ${cronSecret}`
  ) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Unauthorized.",
      },
      {
        status: 401,
      },
    );
  }

  try {
    const result =
      await FreeAgencyCronService.processDuePeriods();

    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,

        error:
          error instanceof Error
            ? error.message
            : "Free Agency cron failed.",
      },
      {
        status: 500,
      },
    );
  }
}

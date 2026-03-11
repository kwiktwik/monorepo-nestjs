import { NextRequest, NextResponse } from "next/server";

/**
 * Internal API: Fetch all user data for migration
 * DISABLED: Migration feature has been stopped.
 * POST /api/internal/user/data
 */
export async function POST(_req: NextRequest) {
  return NextResponse.json(
    { error: "Migration feature has been stopped. This endpoint is no longer available." },
    { status: 410 }
  );
}


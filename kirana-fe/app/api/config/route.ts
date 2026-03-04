import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { getFullConfig } from "./config-data";

/**
 * GET /api/config
 *
 * Fetch application configuration settings
 *
 * Returns dummy configuration data that can be updated later
 *
 * Requires authentication via Better Auth session
 *
 * Response:
 * - 200: Configuration data retrieved successfully
 * - 401: Unauthorized - no valid session
 * - 500: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    // Get the Better Auth session from the incoming request
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 },
      );
    }

    const config = getFullConfig();

    return NextResponse.json(
      {
        success: true,
        data: config,
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET /api/config] Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to fetch config" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

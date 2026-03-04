import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";

/**
 * Endpoint for Android app to check if request is authenticated
 * Returns authentication status and user information if authenticated
 * 
 * This endpoint can be called with:
 * - Cookie-based authentication (session cookies)
 * - Authorization header with Bearer token (JWT)
 * 
 * Response:
 * - 200: Authenticated - returns { authenticated: true, user: {...} }
 * - 401: Not authenticated - returns { authenticated: false, error: "..." }
 */
export async function GET(req: NextRequest) {
  try {
    // Get the Better Auth session from the incoming request
    // This works with both cookies and Authorization headers
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "No valid session found",
        },
        { status: 401 }
      );
    }

    // Return authenticated status with user information
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        emailVerified: session.user.emailVerified,
      },
      session: {
        expiresAt: session.session.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error checking authentication:", error);
    return NextResponse.json(
      {
        authenticated: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

/**
 * POST method for Android app to check authentication
 * Same functionality as GET, but allows sending additional data if needed
 */
export async function POST(req: NextRequest) {
  try {
    // Get the Better Auth session from the incoming request
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session) {
      return NextResponse.json(
        {
          authenticated: false,
          error: "No valid session found",
        },
        { status: 401 }
      );
    }

    // Return authenticated status with user information
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        image: session.user.image,
        emailVerified: session.user.emailVerified,
      },
      session: {
        expiresAt: session.session.expiresAt,
      },
    });
  } catch (error) {
    console.error("Error checking authentication:", error);
    return NextResponse.json(
      {
        authenticated: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}


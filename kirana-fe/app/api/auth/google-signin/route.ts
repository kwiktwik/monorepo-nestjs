import { NextRequest, NextResponse } from "next/server";

/**
 * Endpoint for Android app to sign in with Google
 * Accepts a Google ID token from Android app and creates/authenticates a Better Auth user
 * 
 * Request body:
 * {
 *   "idToken": "string", // Google ID token from Android app (required)
 *   "callbackURL": "string" // Optional callback URL
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, callbackURL } = body;

    if (!idToken || typeof idToken !== "string") {
      return NextResponse.json(
        { error: "Google ID token is required" },
        { status: 400 }
      );
    }

    // Get the base URL for internal requests
    const baseURL = process.env.NEXT_PUBLIC_BASE_URL || new URL(req.url).origin;
    
    // Extract origin from request headers
    let origin = req.headers.get("origin") || baseURL;
    if (!origin || origin === "null") {
      const referer = req.headers.get("referer");
      if (referer) {
        try {
          origin = new URL(referer).origin;
        } catch {
          origin = baseURL;
        }
      } else {
        origin = baseURL;
      }
    }

    // Make an internal request to Better Auth's social sign-in endpoint
    const authBody: {
      provider: string;
      idToken: { token: string };
      callbackURL?: string;
    } = {
      provider: "google",
      idToken: {
        token: idToken,
      },
    };

    // Only include callbackURL if provided
    if (callbackURL && typeof callbackURL === "string") {
      authBody.callbackURL = callbackURL;
    }

    const authResponse = await fetch(`${baseURL}/api/auth/sign-in/social`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Origin": origin,
        "Referer": origin,
        cookie: req.headers.get("cookie") || "",
      },
      body: JSON.stringify(authBody),
    });

    // Get the response data
    const responseData = await authResponse.json().catch(() => ({}));

    // Create a response with the same status and data
    const response = NextResponse.json(responseData, {
      status: authResponse.status,
    });

    // Copy cookies from Better Auth's response to our response
    const setCookieHeader = authResponse.headers.get("set-cookie");
    if (setCookieHeader) {
      // Better Auth sets session cookies, we need to forward them
      const cookies = setCookieHeader.split(",");
      for (const cookie of cookies) {
        const [nameValue] = cookie.split(";");
        const [name, value] = nameValue.split("=");
        if (name && value) {
          response.cookies.set(name.trim(), value.trim(), {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/",
          });
        }
      }
    }

    return response;
  } catch (error) {
    console.error("Error in Google sign-in:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}

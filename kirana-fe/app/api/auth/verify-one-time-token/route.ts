import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";

/**
 * Verify One-Time Token
 * 
 * This endpoint verifies a one-time token using Better Auth's oneTimeToken plugin.
 * One-time tokens are typically used for secure, single-use authentication flows.
 * 
 * Body Parameters:
 * - token: The one-time token to verify (required, string)
 * 
 * Response:
 * - 200: Token verified successfully, returns verification result
 * - 400: Missing or invalid token format
 * - 401: Invalid or expired token
 * - 500: Error verifying token
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { token } = body;

    // Validate required fields
    if (!token || typeof token !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Token is required and must be a string",
        },
        { status: 400 }
      );
    }

    // Use Better Auth's API to verify one-time token
    try {
      console.log("[Verify One-Time Token] Attempting to verify token");
      const result = await auth.api.verifyOneTimeToken({
        body: {
          token: token,
        },
        headers: req.headers,
      });

      console.log("[Verify One-Time Token] Verification successful:", { result });
      
      return NextResponse.json(
        {
          success: true,
          message: "Token verified successfully",
          data: result,
        },
        {
          status: 200,
        }
      );
    } catch (apiError: unknown) {
      console.error("[Verify One-Time Token] Better Auth API error:", apiError);
      
      // Better Auth API errors are thrown as objects with error property
      if (apiError && typeof apiError === "object" && "error" in apiError) {
        const errorObj = apiError as { error?: { message?: string; status?: number } };
        const errorMessage = errorObj.error?.message || "Token verification failed";
        const errorStatus = errorObj.error?.status || 401;
        
        // Log the specific error for debugging
        console.error("[Verify One-Time Token] Error details:", {
          message: errorMessage,
          status: errorStatus,
        });
        
        return NextResponse.json(
          { 
            success: false,
            error: errorMessage 
          },
          { status: errorStatus }
        );
      }
      
      // Re-throw if it's not a Better Auth error
      throw apiError;
    }
  } catch (error) {
    console.error("[Verify One-Time Token] Error:", error);
    return NextResponse.json(
      {
        success: false,
        error:
          error instanceof Error ? error.message : "Unknown error occurred",
      },
      { status: 500 }
    );
  }
}


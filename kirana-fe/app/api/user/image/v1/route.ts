import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import { userImages } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { extractAppId, validateAppId, AppValidationError } from "@/lib/utils/app-validator";

/**
 * GET /api/user/image/v1
 *
 * List images saved for the current user (scoped to X-App-ID).
 *
 * Headers:
 * - X-App-ID: App identifier (required)
 *
 * Requires authentication via Better Auth session
 *
 * Response:
 * - 200: List of user images
 * - 400: Bad Request (missing X-App-ID header)
 * - 401: Unauthorized
 * - 500: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    // Validate app ID from headers - REQUIRED
    const appId = extractAppId(req);

    if (!appId) {
      return NextResponse.json(
        { error: "X-App-ID header is required" },
        { status: 400 }
      );
    }

    // Validate that the app ID is valid and enabled
    try {
      validateAppId(req);
    } catch (error) {
      if (error instanceof AppValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode || 401 }
        );
      }
      throw error;
    }

    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    console.log(
      `[GET /api/user/image/v1] Listing images for userId: ${userId}, appId: ${appId}`
    );

    const rows = await db
      .select({
        id: userImages.id,
        imageUrl: userImages.imageUrl,
        removedBgImageUrl: userImages.removedBgImageUrl,
        createdAt: userImages.createdAt,
      })
      .from(userImages)
      .where(and(eq(userImages.userId, userId), eq(userImages.appId, appId)))
      .orderBy(desc(userImages.createdAt));

    return NextResponse.json({
      success: true,
      data: rows,
    });
  } catch (error) {
    console.error("[GET /api/user/image/v1] Error:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Failed to list images";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

/**
 * DELETE /api/user/image/v1
 * 
 * Delete a specific user image
 * 
 * Query Parameters:
 * - imageUrl: The URL of the image to delete
 * 
 * Headers:
 * - X-App-ID: App identifier (required)
 * 
 * Requires authentication via Better Auth session
 * 
 * Response:
 * - 200: Image deleted successfully (or didn't exist)
 * - 400: Bad Request (missing X-App-ID header or image URL)
 * - 401: Unauthorized
 * - 500: Internal server error
 */
export async function DELETE(req: NextRequest) {
  try {
    // Validate app ID from headers - REQUIRED
    const appId = extractAppId(req);

    if (!appId) {
      return NextResponse.json(
        { error: "X-App-ID header is required" },
        { status: 400 }
      );
    }

    // Validate that the app ID is valid and enabled
    try {
      validateAppId(req);
    } catch (error) {
      if (error instanceof AppValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode || 401 }
        );
      }
      throw error;
    }

    // Get the Better Auth session from the incoming request
    const session = await auth.api.getSession({
      headers: req.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Get image ID from request body
    let imageId: number;
    try {
      const body = await req.json();
      imageId = body.imageId;
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    if (!imageId) {
      return NextResponse.json(
        { error: "Image ID is required" },
        { status: 400 }
      );
    }

    if (typeof imageId !== 'number') {
      return NextResponse.json(
        { error: "Image ID must be a number" },
        { status: 400 }
      );
    }

    console.log(`[DELETE /api/user/image/v1] Deleting image for userId: ${userId}, appId: ${appId}, imageId: ${imageId}`);

    // Delete the image record
    const result = await db
      .delete(userImages)
      .where(
        and(
          eq(userImages.userId, userId),
          eq(userImages.appId, appId),
          eq(userImages.id, imageId)
        )
      )
      .returning();

    if (result.length === 0) {
      console.log(`[DELETE /api/user/image/v1] Image not found or already deleted`);
      return NextResponse.json(
        {
          success: true,
          message: "Image not found or already deleted",
        },
        { status: 200 }
      );
    }

    console.log(`[DELETE /api/user/image/v1] Image deleted successfully`);

    return NextResponse.json(
      {
        success: true,
        message: "Image deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("[DELETE /api/user/image/v1] Error:", error);

    // Explicitly return a typed error message if possible
    const errorMessage = error instanceof Error ? error.message : "Failed to delete image";

    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

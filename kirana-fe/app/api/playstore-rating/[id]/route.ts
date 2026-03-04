import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import { playStoreRatings } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import {
  validateAppId,
  AppValidationError,
} from "@/lib/utils/app-validator";

/**
 * PATCH /api/playstore-rating/:id
 *
 * Mark a Play Store rating as submitted to the Play Store.
 * Only the rating owner can update. Idempotent: if already submitted, just returns current state.
 *
 * Response:
 * - 200: Rating marked as submitted (or already submitted)
 * - 401: Unauthorized - no valid session or invalid app ID
 * - 404: Rating not found or not owned by current user
 * - 500: Internal server error
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    let appId: string;
    try {
      appId = validateAppId(req);
    } catch (error) {
      if (error instanceof AppValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode || 401 },
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
        { status: 401 },
      );
    }

    const userId = session.user.id;
    const { id } = await params;
    const ratingId = parseInt(id, 10);

    if (isNaN(ratingId)) {
      return NextResponse.json(
        { error: "Invalid rating id" },
        { status: 400 },
      );
    }

    const [existing] = await db
      .select()
      .from(playStoreRatings)
      .where(
        and(
          eq(playStoreRatings.id, ratingId),
          eq(playStoreRatings.userId, userId),
          eq(playStoreRatings.appId, appId),
        ),
      )
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: "Rating not found or access denied" },
        { status: 404 },
      );
    }

    const now = new Date();

    // If already submitted, return current state
    if (existing.submittedToPlayStoreAt) {
      return NextResponse.json(
        {
          success: true,
          message: "Rating already submitted to Play Store",
          data: {
            id: existing.id,
            userId: existing.userId,
            appId: existing.appId,
            rating: existing.rating,
            review: existing.review,
            reviewTitle: existing.reviewTitle,
            packageName: existing.packageName,
            appVersion: existing.appVersion,
            deviceModel: existing.deviceModel,
            osVersion: existing.osVersion,
            language: existing.language,
            submittedToPlayStoreAt: existing.submittedToPlayStoreAt,
            createdAt: existing.createdAt,
            updatedAt: existing.updatedAt,
          },
        },
        { status: 200 },
      );
    }

    const [updated] = await db
      .update(playStoreRatings)
      .set({
        submittedToPlayStoreAt: now,
        updatedAt: now,
      })
      .where(eq(playStoreRatings.id, ratingId))
      .returning();

    return NextResponse.json(
      {
        success: true,
        message: "Rating marked as submitted to Play Store",
        data: {
          id: updated!.id,
          userId: updated!.userId,
          appId: updated!.appId,
          rating: updated!.rating,
          review: updated!.review,
          reviewTitle: updated!.reviewTitle,
          packageName: updated!.packageName,
          appVersion: updated!.appVersion,
          deviceModel: updated!.deviceModel,
          osVersion: updated!.osVersion,
          language: updated!.language,
          submittedToPlayStoreAt: updated!.submittedToPlayStoreAt,
          createdAt: updated!.createdAt,
          updatedAt: updated!.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[PATCH /api/playstore-rating/:id] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

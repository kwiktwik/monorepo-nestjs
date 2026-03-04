import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import { playStoreRatings, user } from "@/db/schema";
import { eq, and, desc, isNull, isNotNull } from "drizzle-orm";
import {
  validateAppId,
  AppValidationError,
} from "@/lib/utils/app-validator";

/**
 * POST /api/playstore-rating
 *
 * Store a Play Store rating and review
 *
 * Body Parameters:
 * - rating*: Rating value from 1 to 5 (required)
 * - review: Review text (optional)
 * - reviewTitle: Review title (optional)
 * - packageName: Package name of the app (optional, e.g., "com.example.app")
 * - appVersion: App version when rating was submitted (optional, e.g., "1.2.3")
 * - deviceModel: Device model (optional, e.g., "Pixel 7")
 * - osVersion: Android OS version (optional, e.g., "14")
 * - language: Review language/locale (optional, e.g., "en-US")
 * - submittedToPlayStore: If true, marks this rating as submitted to Play Store (optional, default: false)
 *
 * Requires authentication via Better Auth session
 * Requires X-App-ID header for multi-app support
 *
 * Response:
 * - 200: Rating stored successfully
 * - 400: Invalid input data (rating out of range, etc.)
 * - 401: Unauthorized - no valid session or invalid app ID
 * - 500: Internal server error
 */
export async function POST(req: NextRequest) {
  try {
    // Validate app ID from headers
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

    const userId = session.user.id;
    const body = await req.json();
    const {
      rating,
      review,
      reviewTitle,
      packageName,
      appVersion,
      deviceModel,
      osVersion,
      language,
      submittedToPlayStore,
    } = body;

    console.log(
      "[POST /api/playstore-rating] Request for userId:",
      userId,
      "appId:",
      appId,
      "rating:",
      rating,
    );

    // Validate required fields
    if (rating === undefined || rating === null) {
      return NextResponse.json(
        { error: "Rating is required" },
        { status: 400 },
      );
    }

    // Validate rating is a number between 1 and 5
    const ratingNum = Number(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: "Rating must be a number between 1 and 5" },
        { status: 400 },
      );
    }

    // Validate review length if provided (optional but should be reasonable)
    if (review && typeof review === "string" && review.length > 5000) {
      return NextResponse.json(
        { error: "Review text must be less than 5000 characters" },
        { status: 400 },
      );
    }
    if (reviewTitle && typeof reviewTitle === "string" && reviewTitle.length > 200) {
      return NextResponse.json(
        { error: "Review title must be less than 200 characters" },
        { status: 400 },
      );
    }

    // Verify user exists
    const [userData] = await db
      .select()
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (!userData) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Insert the rating (submittedToPlayStoreAt set only if client confirms submission)
    const now = new Date();
    const [newRating] = await db
      .insert(playStoreRatings)
      .values({
        userId,
        appId,
        rating: ratingNum,
        review: review || null,
        reviewTitle: reviewTitle || null,
        packageName: packageName || null,
        appVersion: appVersion || null,
        deviceModel: deviceModel || null,
        osVersion: osVersion || null,
        language: language || null,
        submittedToPlayStoreAt:
          submittedToPlayStore === true ? now : null,
        updatedAt: now,
      })
      .returning();

    console.log(
      "[POST /api/playstore-rating] Rating stored successfully:",
      newRating.id,
    );

    return NextResponse.json(
      {
        success: true,
        message: "Rating stored successfully",
        data: {
          id: newRating.id,
          userId: newRating.userId,
          appId: newRating.appId,
          rating: newRating.rating,
          review: newRating.review,
          reviewTitle: newRating.reviewTitle,
          packageName: newRating.packageName,
          appVersion: newRating.appVersion,
          deviceModel: newRating.deviceModel,
          osVersion: newRating.osVersion,
          language: newRating.language,
          submittedToPlayStoreAt: newRating.submittedToPlayStoreAt,
          createdAt: newRating.createdAt,
          updatedAt: newRating.updatedAt,
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[POST /api/playstore-rating] Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to store rating" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

/**
 * GET /api/playstore-rating
 *
 * Retrieve Play Store ratings
 *
 * Query Parameters:
 * - userId: Filter by user ID (optional, defaults to current user)
 * - appId: Filter by app ID (optional, defaults to request app ID)
 * - submitted: Filter by submission to Play Store - "true" | "false" (optional; omit for all)
 * - limit: Maximum number of ratings to return (optional, default: 50, max: 100)
 * - offset: Number of ratings to skip (optional, default: 0)
 *
 * Requires authentication via Better Auth session
 * Requires X-App-ID header for multi-app support
 *
 * Response:
 * - 200: Ratings retrieved successfully
 * - 401: Unauthorized - no valid session or invalid app ID
 * - 500: Internal server error
 */
export async function GET(req: NextRequest) {
  try {
    // Validate app ID from headers
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

    const currentUserId = session.user.id;
    const { searchParams } = new URL(req.url);
    const filterUserId = searchParams.get("userId") || currentUserId;
    const filterAppId = searchParams.get("appId") || appId;
    const submittedFilter = searchParams.get("submitted"); // "true" | "false" | null (all)
    const limit = Math.min(
      parseInt(searchParams.get("limit") || "50"),
      100,
    );
    const offset = parseInt(searchParams.get("offset") || "0");

    console.log(
      "[GET /api/playstore-rating] Request for userId:",
      currentUserId,
      "filterUserId:",
      filterUserId,
      "appId:",
      appId,
      "filterAppId:",
      filterAppId,
    );

    // Build query conditions
    const conditions = [eq(playStoreRatings.appId, filterAppId)];

    // If filtering by a different user, check if current user has permission
    // For now, only allow users to see their own ratings or all ratings for their app
    // You can modify this logic based on your requirements
    if (filterUserId !== currentUserId) {
      // Only allow admins or same app users to see other users' ratings
      // For now, we'll restrict to own ratings only
      conditions.push(eq(playStoreRatings.userId, currentUserId));
    } else {
      conditions.push(eq(playStoreRatings.userId, filterUserId));
    }

    if (submittedFilter === "true") {
      conditions.push(isNotNull(playStoreRatings.submittedToPlayStoreAt));
    } else if (submittedFilter === "false") {
      conditions.push(isNull(playStoreRatings.submittedToPlayStoreAt));
    }

    // Fetch ratings
    const ratings = await db
      .select()
      .from(playStoreRatings)
      .where(and(...conditions))
      .orderBy(desc(playStoreRatings.createdAt))
      .limit(limit)
      .offset(offset);

    // Get total count for pagination
    const totalCount = await db
      .select()
      .from(playStoreRatings)
      .where(and(...conditions));

    console.log(
      "[GET /api/playstore-rating] Ratings retrieved:",
      ratings.length,
      "total:",
      totalCount.length,
    );

    return NextResponse.json(
      {
        success: true,
        data: {
          ratings: ratings.map((rating) => ({
            id: rating.id,
            userId: rating.userId,
            appId: rating.appId,
            rating: rating.rating,
            review: rating.review,
            reviewTitle: rating.reviewTitle,
            packageName: rating.packageName,
            appVersion: rating.appVersion,
            deviceModel: rating.deviceModel,
            osVersion: rating.osVersion,
            language: rating.language,
            submittedToPlayStoreAt: rating.submittedToPlayStoreAt,
            createdAt: rating.createdAt,
            updatedAt: rating.updatedAt,
          })),
          pagination: {
            total: totalCount.length,
            limit,
            offset,
            hasMore: offset + limit < totalCount.length,
          },
        },
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("[GET /api/playstore-rating] Error:", error);

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message || "Failed to retrieve ratings" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

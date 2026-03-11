import { NextRequest, NextResponse } from "next/server";
import { desc, lte, eq, and } from "drizzle-orm";
import { kwiktwikDb } from "@/app/(krafto)/db";
import { craftoQuotes } from "@/app/(krafto)/drizzle/schema";
import { auth } from "@/lib/better-auth/auth";

import { extractAppId, validateAppId, AppValidationError } from "@/lib/utils/app-validator";

interface QuoteResponse {
  type: "QUOTE";
  data: Record<string, unknown>;
}

interface FeedResponse {
  filterText: string | null;
  selectedFilterId: string | null;
  data: QuoteResponse[];
  offset: string | null; // Deprecated: Use cursor instead
  cursor: string | null; // New: Cursor for next page (base64 encoded)
  hasMore: boolean; // New: Indicates if there are more items
  limit: number;
  popup: null;
  isBuggyFeedAlertWhitelisted: boolean;
  configuration: {
    logImageLoadExceptionEvents: boolean;
    logImageLoadSuccessEvent: boolean;
    logVideoExceptionEvent: boolean;
    logVideoLoadSuccessEvent: boolean;
  };
}

/**
 * Get default offset for first page (current time in IST, YYYYMMDDHH format)
 */
function getDefaultOffset(): string {
  const now = new Date();
  // IST is UTC+5:30
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(now.getTime() + istOffset);

  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(istDate.getUTCDate()).padStart(2, "0");
  const hour = String(istDate.getUTCHours()).padStart(2, "0");

  return `${year}${month}${day}${hour}`;
}

/**
 * Parse offset string (YYYYMMDDHH) to Date object
 */
function parseOffset(offset: string): Date | null {
  if (offset.length !== 10) return null;

  const year = parseInt(offset.slice(0, 4), 10);
  const month = parseInt(offset.slice(4, 6), 10) - 1;
  const day = parseInt(offset.slice(6, 8), 10);
  const hour = parseInt(offset.slice(8, 10), 10);

  if (isNaN(year) || isNaN(month) || isNaN(day) || isNaN(hour)) {
    return null;
  }

  // Create date in IST, then convert to UTC
  const istDate = new Date(Date.UTC(year, month, day, hour, 0, 0));
  // Subtract IST offset to get UTC
  const utcDate = new Date(istDate.getTime() - 5.5 * 60 * 60 * 1000);

  return utcDate;
}

/**
 * Convert Date to offset string (YYYYMMDDHH in IST)
 */
function dateToOffset(date: Date): string {
  const istOffset = 5.5 * 60 * 60 * 1000;
  const istDate = new Date(date.getTime() + istOffset);

  const year = istDate.getUTCFullYear();
  const month = String(istDate.getUTCMonth() + 1).padStart(2, "0");
  const day = String(istDate.getUTCDate()).padStart(2, "0");
  const hour = String(istDate.getUTCHours()).padStart(2, "0");

  return `${year}${month}${day}${hour}`;
}

/**
 * Encode cursor for pagination (contains timestamp and ID)
 */
function encodeCursor(timestamp: string, id: number): string {
  const cursorData = JSON.stringify({ timestamp, id });
  return Buffer.from(cursorData).toString('base64');
}

/**
 * Decode cursor to get timestamp and ID
 */
function decodeCursor(cursor: string): { timestamp: string; id: number } | null {
  try {
    const decoded = Buffer.from(cursor, 'base64').toString('utf-8');
    const parsed = JSON.parse(decoded);
    if (parsed.timestamp && typeof parsed.id === 'number') {
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}


/**
 * Format a quote to match expected API response format
 */
function formatQuoteResponse(rawJson: Record<string, unknown>): QuoteResponse {
  return {
    type: "QUOTE",
    data: rawJson,
  };
}


/**
 * GET /api/crafto/home/v1.7
 * 
 * Fetch Crafto quotes from database with pagination.
 * 
 * Headers:
 * - X-App-ID: App identifier (required)
 * 
 * Query params:
 * - cursor: (Recommended) Base64 encoded cursor for pagination
 * - offset: (Deprecated) Offset string in YYYYMMDDHH format (e.g., "2026010420")
 * - limit: Number of items per page (default: 20, max: 100)
 * - category: Category type filter (optional, e.g., "motivational", "funny")
 */
export async function GET(request: NextRequest) {
  try {
    // Print all request headers for debugging
    console.log('[GET /api/crafto/home/v1.7] Request Headers:');
    request.headers.forEach((value, key) => {
      console.log(`  ${key}: ${value}`);
    });

    // Validate app ID from headers - REQUIRED
    const appId = extractAppId(request);

    if (!appId) {
      return NextResponse.json(
        { error: "X-App-ID header is required" },
        { status: 400 }
      );
    }

    // Validate that the app ID is valid and enabled
    try {
      validateAppId(request);
    } catch (error) {
      if (error instanceof AppValidationError) {
        return NextResponse.json(
          { error: error.message },
          { status: error.statusCode || 401 }
        );
      }
      throw error;
    }

    // Authenticate user
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);

    const cursorParam = searchParams.get("cursor");
    const offsetParam = searchParams.get("offset");
    const limitParam = searchParams.get("limit");
    const categoryParam = searchParams.get("category");

    // Parse and validate limit
    let limit = 20;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam, 10);
      if (!isNaN(parsedLimit) && parsedLimit >= 1 && parsedLimit <= 100) {
        limit = parsedLimit;
      }
    }

    // Determine pagination method: cursor takes precedence
    let offsetDate: Date;
    let lastId: number | null = null;

    if (cursorParam) {
      // Use cursor-based pagination (preferred)
      const cursorData = decodeCursor(cursorParam);
      if (!cursorData) {
        return NextResponse.json(
          { error: "Invalid cursor format" },
          { status: 400 }
        );
      }

      offsetDate = new Date(cursorData.timestamp);
      lastId = cursorData.id;
    } else {
      // Fallback to offset-based pagination
      const offset = offsetParam || getDefaultOffset();
      const parsedOffset = parseOffset(offset);

      if (!parsedOffset) {
        return NextResponse.json(
          { error: "Invalid offset format. Expected YYYYMMDDHH" },
          { status: 400 }
        );
      }

      offsetDate = parsedOffset;
    }


    // Build where conditions
    const conditions = [lte(craftoQuotes.createdAt, offsetDate.toISOString())];

    // If using cursor, also filter by ID to ensure we don't get duplicates
    if (lastId !== null) {
      // For items with the same timestamp, only get items with ID < lastId
      // Convert to BigInt since the ID column is bigint type
      conditions.push(lte(craftoQuotes.id, BigInt(lastId)));
    }

    // Add category filter if provided
    if (categoryParam) {
      conditions.push(eq(craftoQuotes.categoryType, categoryParam));
    }

    // Fetch quotes from database
    // Get quotes where createdAt <= offset date (and id < lastId if cursor provided)
    // Ordered by createdAt desc, then id desc for consistent ordering
    const quotes = await kwiktwikDb
      .select({
        id: craftoQuotes.id,
        rawJson: craftoQuotes.rawJson,
        createdAt: craftoQuotes.createdAt,
        // Include columns that might contain URLs
        url: craftoQuotes.url,
        videoUrl: craftoQuotes.videoUrl,
        previewImageUrl: craftoQuotes.previewImageUrl,
        stickerUrl: craftoQuotes.stickerUrl,
      })
      .from(craftoQuotes)
      .where(and(...conditions))
      .orderBy(desc(craftoQuotes.createdAt), desc(craftoQuotes.id))
      .limit(limit + 1); // Fetch one extra to determine if there's a next page


    // Check if there's a next page
    const hasNextPage = quotes.length > limit;
    const quotesToReturn = hasNextPage ? quotes.slice(0, limit) : quotes;



    // Calculate next cursor and offset from the last item
    let nextOffset: string | null = null;
    let nextCursor: string | null = null;

    if (hasNextPage && quotesToReturn.length > 0) {
      const lastQuote = quotesToReturn[quotesToReturn.length - 1];
      if (lastQuote.createdAt && lastQuote.id) {
        const lastDate = new Date(lastQuote.createdAt);
        // Generate offset for backward compatibility
        nextOffset = dateToOffset(lastDate);
        // Generate cursor (preferred method) - convert bigint to number
        nextCursor = encodeCursor(lastQuote.createdAt, Number(lastQuote.id));
      }
    }

    // Format quotes to match expected response structure
    const formattedQuotes: QuoteResponse[] = quotesToReturn
      .filter((q) => q.rawJson !== null)
      .map((q) => formatQuoteResponse(q.rawJson as Record<string, unknown>));

    // Build response matching Crafto API format
    const response: FeedResponse = {
      filterText: categoryParam ?? null,
      selectedFilterId: categoryParam ?? null,
      data: formattedQuotes,
      offset: nextOffset, // Deprecated: kept for backward compatibility
      cursor: nextCursor, // New: recommended for infinite scroll
      hasMore: hasNextPage, // New: clear indicator for more items
      limit: limit,
      popup: null,
      isBuggyFeedAlertWhitelisted: false,
      configuration: {
        logImageLoadExceptionEvents: true,
        logImageLoadSuccessEvent: false,
        logVideoExceptionEvent: true,
        logVideoLoadSuccessEvent: false,
      },
    };


    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching crafto feed:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

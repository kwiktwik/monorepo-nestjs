import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { kwiktwikDb } from "@/app/(krafto)/db";
import { craftoQuotes } from "@/app/(krafto)/drizzle/schema";
import { auth } from "@/lib/better-auth/auth";

interface CategoriesResponse {
  categories: string[];
  count: number;
}

/**
 * GET /api/crafto/categories
 * 
 * Get all unique category types from the Crafto quotes database.
 * 
 * Returns:
 * {
 *   "categories": ["category1", "category2", ...],
 *   "count": 10
 * }
 */
export async function GET(request: NextRequest) {
  try {
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

    // Get unique category types from database
    const result = await kwiktwikDb
      .selectDistinct({ categoryType: craftoQuotes.categoryType })
      .from(craftoQuotes)
      .where(sql`${craftoQuotes.categoryType} IS NOT NULL`);
    
    const categories = result
      .map((r) => r.categoryType)
      .filter((c): c is string => c !== null)
      .sort();
    
    const response: CategoriesResponse = {
      categories,
      count: categories.length,
    };
    
    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

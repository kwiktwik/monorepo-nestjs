import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/better-auth/auth";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { getAppNameFromPackage } from "@/app/constant";

/**
 * POST endpoint to capture payment notification from different apps
 * Note: This endpoint is kept for backward compatibility, but notifications
 * should be created via /api/notifications endpoint
 * Expected body: { appName: string, amount: number, currency?: string }
 */
export async function POST(request: NextRequest) {
  try {
    // Get the Better Auth session from the incoming request
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    const body = await request.json();

    if (!body.appName || body.amount === undefined) {
      return NextResponse.json(
        { error: "appName and amount are required" },
        { status: 400 }
      );
    }

    if (typeof body.amount !== "number" || body.amount < 0) {
      return NextResponse.json(
        { error: "amount must be a positive number" },
        { status: 400 }
      );
    }

    // Note: This endpoint is for backward compatibility only
    // Actual notifications should be created via /api/notifications
    return NextResponse.json(
      {
        success: true,
        message: "Please use /api/notifications endpoint to create notifications",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error in POST /api/analytics:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process request";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to fetch analytics
 * Query params: period (today, week, month, year) - optional, defaults to all
 */
export async function GET(request: NextRequest) {
  try {
    // Get the Better Auth session from the incoming request
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { error: "Unauthorized - no valid session" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const searchParams = request.nextUrl.searchParams;
    const period = searchParams.get("period"); // today, week, month, year, or null for all

    // Fetch all valid notifications for the user
    const allNotifications = await db
      .select()
      .from(notifications)
      .where(
        and(
          eq(notifications.userId, userId),
          sql`${notifications.metadata} IS NOT NULL AND ${notifications.metadata}->>'isValid' = 'true'`
        )
      );

    // Transform notifications to transactions format
    const transactions = allNotifications
      .map((notification) => {
        const metadata = notification.metadata as { amount: number; from: string; isValid: boolean } | null;
        if (!metadata || !metadata.amount || metadata.amount <= 0) {
          return null;
        }
        return {
          id: notification.id,
          appName: getAppNameFromPackage(notification.packageName),
          amount: metadata.amount,
          currency: "INR",
          createdAt: notification.createdAt,
        };
      })
      .filter((t): t is NonNullable<typeof t> => t !== null);

    const now = new Date();
    let startDate: Date | null = null;

    // Calculate start date based on period
    switch (period) {
      case "today":
        startDate = new Date(now);
        startDate.setUTCHours(0, 0, 0, 0);
        break;
      case "week":
        startDate = new Date(now);
        startDate.setUTCDate(now.getUTCDate() - 7);
        startDate.setUTCHours(0, 0, 0, 0);
        break;
      case "month":
        startDate = new Date(now);
        startDate.setUTCMonth(now.getUTCMonth() - 1);
        startDate.setUTCHours(0, 0, 0, 0);
        break;
      case "year":
        startDate = new Date(now);
        startDate.setUTCFullYear(now.getUTCFullYear() - 1);
        startDate.setUTCHours(0, 0, 0, 0);
        break;
      default:
        startDate = null;
    }

    // Filter transactions based on period
    const filteredTransactions = startDate
      ? transactions.filter((t) => t.createdAt >= startDate!)
      : transactions;

    // Get all period stats
    const [todayStats, weekStats, monthStats, yearStats, allTimeStats] =
      await Promise.all([
        getPeriodStats("today", transactions),
        getPeriodStats("week", transactions),
        getPeriodStats("month", transactions),
        getPeriodStats("year", transactions),
        getPeriodStats(null, transactions),
      ]);

    // Get top apps by payment count and amount
    const topApps = getTopApps(filteredTransactions);

    return NextResponse.json({
      periods: {
        today: todayStats,
        week: weekStats,
        month: monthStats,
        year: yearStats,
        allTime: allTimeStats,
      },
      topApps,
      currentPeriod: period || "allTime",
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch analytics";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Helper function to get statistics for a specific period
 */
function getPeriodStats(
  period: string | null,
  transactions: Array<{
    id: number;
    appName: string;
    amount: number;
    currency: string;
    createdAt: Date;
  }>
) {
  const now = new Date();
  let startDate: Date | null = null;

  switch (period) {
    case "today":
      startDate = new Date(now);
      startDate.setUTCHours(0, 0, 0, 0);
      break;
    case "week":
      startDate = new Date(now);
      startDate.setUTCDate(now.getUTCDate() - 7);
      startDate.setUTCHours(0, 0, 0, 0);
      break;
    case "month":
      startDate = new Date(now);
      startDate.setUTCMonth(now.getUTCMonth() - 1);
      startDate.setUTCHours(0, 0, 0, 0);
      break;
    case "year":
      startDate = new Date(now);
      startDate.setUTCFullYear(now.getUTCFullYear() - 1);
      startDate.setUTCHours(0, 0, 0, 0);
      break;
    default:
      startDate = null;
  }

  const filteredTransactions = startDate
    ? transactions.filter((t) => t.createdAt >= startDate!)
    : transactions;

  const transactionCount = filteredTransactions.length;
  const totalAmount = filteredTransactions.reduce(
    (sum, t) => sum + t.amount,
    0
  );

  return {
    transactionCount,
    totalAmount,
    totalAmountFormatted: formatAmount(totalAmount),
  };
}

/**
 * Helper function to get top apps by payment count and amount
 */
function getTopApps(
  filteredTransactions: Array<{
    id: number;
    appName: string;
    amount: number;
    currency: string;
    createdAt: Date;
  }>
) {
  // Group by app name
  const appStats = new Map<
    string,
    { transactionCount: number; totalAmount: number }
  >();

  filteredTransactions.forEach((transaction) => {
    const existing = appStats.get(transaction.appName) || {
      transactionCount: 0,
      totalAmount: 0,
    };
    appStats.set(transaction.appName, {
      transactionCount: existing.transactionCount + 1,
      totalAmount: existing.totalAmount + transaction.amount,
    });
  });

  // Convert to array and sort
  const appsArray = Array.from(appStats.entries()).map(([appName, stats]) => ({
    appName,
    ...stats,
  }));

  const topAppsByCount = [...appsArray]
    .sort((a, b) => b.transactionCount - a.transactionCount)
    .slice(0, 10)
    .map((app) => ({
      appName: app.appName,
      transactionCount: app.transactionCount,
      totalAmount: app.totalAmount,
      totalAmountFormatted: formatAmount(app.totalAmount),
    }));

  const topAppsByAmount = [...appsArray]
    .sort((a, b) => b.totalAmount - a.totalAmount)
    .slice(0, 10)
    .map((app) => ({
      appName: app.appName,
      transactionCount: app.transactionCount,
      totalAmount: app.totalAmount,
      totalAmountFormatted: formatAmount(app.totalAmount),
    }));

  return {
    byTransactionCount: topAppsByCount,
    byTotalAmount: topAppsByAmount,
  };
}

/**
 * Helper function to format amount (amount is already in rupees)
 */
function formatAmount(amountInRupees: number): string {
  return `₹${amountInRupees.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

// Fetch all tokens for a customer
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customer_id");

    if (!customerId) {
      return NextResponse.json(
        { error: "customer_id is required" },
        { status: 400 }
      );
    }

    const tokens = await razorpay.customers.fetchTokens(customerId);
    return NextResponse.json(tokens);
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to fetch tokens" },
      { status: err.statusCode || 500 }
    );
  }
}

// Delete a token
export async function DELETE(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const customerId = searchParams.get("customer_id");
    const tokenId = searchParams.get("token_id");

    if (!customerId || !tokenId) {
      return NextResponse.json(
        { error: "customer_id and token_id are required" },
        { status: 400 }
      );
    }

    await razorpay.customers.deleteToken(customerId, tokenId);
    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to delete token" },
      { status: err.statusCode || 500 }
    );
  }
}

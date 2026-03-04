import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";

// Create subsequent recurring payment using token
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const payment = await razorpay.payments.createRecurringPayment({
      email: body.email,
      contact: body.contact,
      amount: body.amount, // Amount in paise
      currency: body.currency || "INR",
      order_id: body.order_id,
      customer_id: body.customer_id,
      token: body.token_id,
      recurring: "1",
      description: body.description,
      notes: body.notes,
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error: unknown) {
    const err = error as { statusCode?: number; message?: string };
    return NextResponse.json(
      { error: err.message || "Failed to create recurring payment" },
      { status: err.statusCode || 500 }
    );
  }
}

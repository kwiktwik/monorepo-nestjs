import { NextRequest, NextResponse } from "next/server";
import { razorpay } from "@/lib/razorpay";
import Razorpay from "razorpay";

interface RazorpayCustomer {
  id: string;
  name?: string;
  email?: string;
  contact?: string | number;
  gstin?: string | null;
  notes?: Record<string, string | number | null>;
}

async function findCustomerByEmailOrContact(
  instance: Razorpay,
  email: string,
  contact: string
): Promise<RazorpayCustomer | null> {
  let skip: number = 0;
  const count = 100;
  const maxSkip = 1000; // Limit search to prevent infinite loops

  while (skip < maxSkip) {
    const customers = await instance.customers.all({
      count,
      skip,
    });

    if (!customers.items || customers.items.length === 0) {
      break;
    }

    // Match by email or contact (phone)
    const matchedCustomer = customers.items.find(
      (customer) => customer.email === email || customer.contact === contact
    );

    if (matchedCustomer) {
      return matchedCustomer;
    }

    skip += count;
  }

  return null;
}

// Create order for UPI recurring payments (authorization transaction)
// https://razorpay.com/docs/api/payments/recurring-payments/upi/create-authorization-transaction/#112-create-an-order
export async function POST(request: NextRequest) {
  try {
    const {
      amount,
      currency = "INR",
      method = "upi",
      token,
      receipt,
      notes,
    } = await request.json();

    const email = notes?.email;
    const contact = notes?.contact;
    if (!email || !contact) {
      return NextResponse.json(
        { error: "email and contact are required" },
        { status: 400 }
      );
    }
    if (!amount) {
      return NextResponse.json(
        { error: "Amount is required" },
        { status: 400 }
      );
    }

    let customerId: string | null = null;
    try {
      const customer = await razorpay.customers.create({
        name: email,
        email: email,
        contact: contact,
        fail_existing: 0,
        notes: notes,
      });
      customerId = customer.id;
    } catch (error: unknown) {
      const errorMessage = (error as { error: { description: string } }).error
        .description;
      if (errorMessage.toLowerCase().includes("customer already exists")) {
        const customer = await findCustomerByEmailOrContact(
          razorpay,
          email,
          contact
        );
        customerId = customer?.id || null;
      } else {
        console.error("Customer creation error:", errorMessage);
        return NextResponse.json(
          {
            error: errorMessage,
          },
          { status: 500 }
        );
      }
    }

    // Ensure that token.expire_at (here set to end_time) is between 946684800 and 4765046400 (UNIX seconds)
    const nowSeconds = Math.floor(Date.now() / 1000);
    const defaultExpireAt = nowSeconds + 60 * 60 * 24 * 30; // 30 days from now
    let expireAt = token?.expire_at ?? defaultExpireAt;

    // If expireAt is in milliseconds, convert to seconds
    if (expireAt > 4765046400 * 1000) {
      expireAt = Math.floor(expireAt / 1000);
    }

    // Clamp expireAt to allowed range
    const minEndTime = 946684800;
    const maxEndTime = 4765046400;
    if (expireAt < minEndTime) expireAt = minEndTime;
    if (expireAt > maxEndTime) expireAt = maxEndTime;

    const order = await razorpay.orders.create({
      amount,
      currency,
      customer_id: customerId ?? undefined,
      method,
      token: {
        max_amount: token?.max_amount ?? amount * 12,
        expire_at: expireAt,
        frequency: token?.frequency ?? "monthly",
        ...(token?.recurring_value && {
          recurring_value: token.recurring_value,
        }),
        ...(token?.recurring_type && { recurring_type: token.recurring_type }),
      },
      receipt,
      notes,
    });

    return NextResponse.json({
      order,
      razorpayOrder: {
        ...order,
        order_id: order.id,
        customer_id: customerId ?? undefined,
        token: {
          max_amount: token?.max_amount ?? amount * 12,
          expire_at: expireAt,
          frequency: token?.frequency ?? "monthly",
          ...(token?.recurring_value && {
            recurring_value: token.recurring_value,
          }),
          ...(token?.recurring_type && {
            recurring_type: token.recurring_type,
          }),
        },
      },
    });
  } catch (error: any) {
    console.error("Error creating recurring order:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create recurring order" },
      { status: 500 }
    );
  }
}

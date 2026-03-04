import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { orders, subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ORDER_STATUS } from "@/lib/constants/order-status";

export async function POST(request: NextRequest) {
  console.log("[Verify] Payment verification request received");
  
  try {
    const { 
      razorpay_order_id, 
      razorpay_subscription_id,
      razorpay_payment_id, 
      razorpay_signature
    } = await request.json();
    
    console.log("[Verify] Request parameters:", {
      razorpay_order_id,
      razorpay_subscription_id,
      razorpay_payment_id,
      has_signature: !!razorpay_signature
    });

    console.log("Payment verification request:", {
      razorpay_order_id,
      razorpay_subscription_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    // Check if we have either order_id or subscription_id
    if ((!razorpay_order_id && !razorpay_subscription_id) || !razorpay_payment_id || !razorpay_signature) {
      console.error("[Verify] Missing required parameters:", {
        has_order_id: !!razorpay_order_id,
        has_subscription_id: !!razorpay_subscription_id,
        has_payment_id: !!razorpay_payment_id,
        has_signature: !!razorpay_signature
      });
      return NextResponse.json(
        { error: "Missing required parameters. Provide either razorpay_order_id or razorpay_subscription_id along with razorpay_payment_id and razorpay_signature" },
        { status: 400 }
      );
    }

    // Get key_secret from environment variable (secure)
    const secret = process.env.RAZORPAY_KEY_SECRET!;

    // Determine entity type
    const entityType = razorpay_order_id ? "order" : "subscription";
    console.log(`[Verify] Processing ${entityType} verification`);

    // Generate signature based on entity type
    // For orders: order_id|payment_id
    // For subscriptions: payment_id|subscription_id (as per Razorpay docs)
    const signaturePayload = entityType === "order"
      ? `${razorpay_order_id}|${razorpay_payment_id}`
      : `${razorpay_payment_id}|${razorpay_subscription_id}`;
    
    console.log(`[Verify] Signature payload created for ${entityType}`);
    
    const generated_signature = crypto
      .createHmac("sha256", secret)
      .update(signaturePayload)
      .digest("hex");
    
    console.log("[Verify] Signature verification:", {
      matches: generated_signature === razorpay_signature,
      entityType
    });

    if (generated_signature === razorpay_signature) {
      console.log(`[Verify] Signature verified successfully for ${entityType}`);
      
      // Update database based on entity type
      try {
        if (entityType === "order") {
          console.log(`[Verify] Updating order ${razorpay_order_id} to CAPTURED status`);
          await db
            .update(orders)
            .set({
              status: ORDER_STATUS.CAPTURED,
              razorpayPaymentId: razorpay_payment_id,
              updatedAt: new Date(),
            })
            .where(eq(orders.razorpayOrderId, razorpay_order_id));
          
          console.log(`[Verify] Order ${razorpay_order_id} status updated to captured`);
        } else {
          // Update subscription status
          console.log(`[Verify] Updating subscription ${razorpay_subscription_id} to active status`);
          await db
            .update(subscriptions)
            .set({
              status: "active",
              updatedAt: new Date(),
            })
            .where(eq(subscriptions.razorpaySubscriptionId, razorpay_subscription_id));
          
          console.log(`[Verify] Subscription ${razorpay_subscription_id} status updated to active`);
        }
      } catch (dbError) {
        console.error(`[Verify] Error updating ${entityType} status:`, dbError);
        console.error("[Verify] Database error details:", {
          entityType,
          entityId: razorpay_order_id || razorpay_subscription_id,
          error: dbError instanceof Error ? dbError.message : String(dbError)
        });
        // Continue even if DB update fails - verification was successful
      }

      console.log(`[Verify] Verification successful for ${entityType}:`, {
        entityId: razorpay_order_id || razorpay_subscription_id,
        paymentId: razorpay_payment_id
      });
      
      return NextResponse.json({
        verified: true,
        message: `${entityType.charAt(0).toUpperCase() + entityType.slice(1)} payment verified successfully`,
        entityType,
      });
    } else {
      return NextResponse.json(
        { verified: false, error: "Invalid signature" },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Payment verification error:", error);
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/db";
import { razorpay } from "@/lib/razorpay";
import { orders, subscriptions, subscriptionLogs, user } from "@/db/schema";
import { eq } from "drizzle-orm";
import { ORDER_STATUS } from "@/lib/constants/order-status";
import {
  sendAnalyticsEvent,
  sendFacebookConversionEvent,
  type UserData,
} from "@/lib/events/server";
import { ANALYTICS_EVENTS } from "@/lib/events/constant";

const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET || "";

function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature = crypto
    .createHmac("sha256", secret)
    .update(body)
    .digest("hex");
  return expectedSignature === signature;
}

type WebhookLogIds = {
  event?: string;
  paymentId?: string;
  orderId?: string;
  subscriptionId?: string;
  invoiceId?: string;
  tokenId?: string;
};

type AuthorizedPaymentForFacebook = {
  id: string;
  amount: number;
  currency?: string;
};

function extractWebhookIds(event: unknown): WebhookLogIds {
  const e = event as {
    event?: string;
    payload?: {
      payment?: {
        entity?: { id?: string; order_id?: string; invoice_id?: string };
      };
      order?: { entity?: { id?: string } };
      subscription?: {
        entity?: { id?: string; latest_invoice?: { id?: string } };
      };
      token?: { entity?: { id?: string; order_id?: string } };
    };
  };

  const payment = e?.payload?.payment?.entity;
  const order = e?.payload?.order?.entity;
  const subscription = e?.payload?.subscription?.entity;
  const token = e?.payload?.token?.entity;

  return {
    event: e?.event,
    paymentId: payment?.id,
    orderId: payment?.order_id ?? order?.id ?? token?.order_id,
    subscriptionId: subscription?.id,
    invoiceId: payment?.invoice_id ?? subscription?.latest_invoice?.id,
    tokenId: token?.id,
  };
}

function formatWebhookIds(ids: WebhookLogIds) {
  const parts: string[] = [];
  if (ids.paymentId) parts.push(`paymentId=${ids.paymentId}`);
  if (ids.orderId) parts.push(`orderId=${ids.orderId}`);
  if (ids.subscriptionId) parts.push(`subscriptionId=${ids.subscriptionId}`);
  if (ids.invoiceId) parts.push(`invoiceId=${ids.invoiceId}`);
  if (ids.tokenId) parts.push(`tokenId=${ids.tokenId}`);
  return parts.length > 0 ? parts.join(" ") : "no-ids";
}

/**
 * Helper function to fetch user info for analytics tracking
 */
async function getUserInfoForAnalytics(userId: string) {
  try {
    const userInfo = await db
      .select({
        email: user.email,
        phone: user.phoneNumber,
        name: user.name,
      })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (userInfo.length > 0) {
      const nameParts = userInfo[0].name?.split(" ") || [];
      return {
        userId,
        email: userInfo[0].email,
        phone: userInfo[0].phone || undefined,
        firstName: nameParts[0] || undefined,
        lastName: nameParts.slice(1).join(" ") || undefined,
      };
    }
    return null;
  } catch (error) {
    console.error("Failed to fetch user info for analytics:", error);
    return null;
  }
}

/**
 * Helper function to track analytics for order-based events
 * Sends events to Firebase Analytics, Facebook Conversion API, and Mixpanel
 */
async function trackOrderAnalytics(
  requestId: string,
  orderId: string,
  eventName: string,
  eventProperties: Record<string, string | number | boolean | undefined>,
) {
  try {
    const orderInfo = await db
      .select({
        userId: orders.userId,
        amount: orders.amount,
        appId: orders.appId,
      })
      .from(orders)
      .where(eq(orders.razorpayOrderId, orderId))
      .limit(1);

    let userInfo: UserData = {};
    let appId: string | undefined = undefined;

    if (orderInfo.length > 0) {
      appId = orderInfo[0].appId ?? undefined;
      if (orderInfo[0].userId) {
        userInfo = { userId: orderInfo[0].userId };
        const dbUser = await getUserInfoForAnalytics(orderInfo[0].userId);
        if (dbUser) {
          userInfo = dbUser;
        }
      }
    }

    const mixpanelSafeEventProperties = userInfo.userId
      ? { ...eventProperties, user_id: userInfo.userId }
      : eventProperties;

    await sendAnalyticsEvent(
      eventName,
      userInfo,
      mixpanelSafeEventProperties,
      undefined,
      appId,
    );
  } catch (error) {
    console.error(
      `[WEBHOOK ${requestId}] ⚠️  Failed to track ${eventName} analytics:`,
      error,
    );
  }
}

/**
 * Sends a Facebook Purchase event for authorized payments using the internal
 * order id (`orders.id`) as the deduplication key.
 */
async function trackAuthorizedOrderFacebookPurchase(
  requestId: string,
  razorpayOrderId: string,
  payment: AuthorizedPaymentForFacebook,
) {
  try {
    const orderInfo = await db
      .select({
        userId: orders.userId,
        amount: orders.amount,
        appId: orders.appId,
      })
      .from(orders)
      .where(eq(orders.razorpayOrderId, razorpayOrderId))
      .limit(1);

    if (orderInfo.length === 0) {
      console.warn(
        `[WEBHOOK ${requestId}] ⚠️  Skipping Facebook Purchase for payment.authorized: order not found for razorpayOrderId=${razorpayOrderId}`,
      );
      return;
    }

    // orders.amount is stored in paise; convert to rupees
    const amountInRupees =
      orderInfo[0].amount != null ? orderInfo[0].amount / 100 : 0;

    // Fire Purchase only when DB amount is exactly 5 rupees
    if (amountInRupees !== 5) {
      console.log(
        `[WEBHOOK ${requestId}] ℹ️  Skipping Facebook Purchase for payment.authorized: DB amount is ${amountInRupees}, not 5`,
      );
      return;
    }

    let userInfo: UserData = {};
    if (orderInfo[0].userId) {
      userInfo = { userId: orderInfo[0].userId };
      const dbUser = await getUserInfoForAnalytics(orderInfo[0].userId);
      if (dbUser) {
        userInfo = dbUser;
      }
    }

    await sendFacebookConversionEvent(
      "Purchase",
      userInfo,
      {
        order_id: razorpayOrderId,
        payment_id: payment.id,
        value: amountInRupees,
        currency: payment.currency || "INR",
      },
      orderInfo[0].appId ?? undefined,
      payment.id,
    );
    console.log(
      `[WEBHOOK ${requestId}] | Payment ID: ${payment.id} | Order ID: ${razorpayOrderId} | ✅ Facebook Purchase event sent successfully for payment.authorized`,
    );
  } catch (error) {
    console.error(
      `[WEBHOOK ${requestId}] ⚠️  Failed to track Facebook Purchase for payment.authorized:`,
      error,
    );
  }
}

/**
 * Helper function to track analytics for subscription-based events
 * Sends events to Firebase Analytics, Facebook Conversion API, and Mixpanel
 */
async function trackSubscriptionAnalytics(
  requestId: string,
  subscriptionId: string,
  eventName: string,
  eventProperties: Record<string, string | number | boolean | undefined>,
  facebookCustomData?: Record<string, string | number | boolean | undefined>,
) {
  try {
    const subInfo = await db
      .select({ userId: subscriptions.userId, appId: subscriptions.appId })
      .from(subscriptions)
      .where(eq(subscriptions.razorpaySubscriptionId, subscriptionId))
      .limit(1);

    let userInfo: UserData = {};
    let appId: string | undefined = undefined;

    if (subInfo.length > 0) {
      appId = subInfo[0].appId ?? undefined;
      if (subInfo[0].userId) {
        userInfo = { userId: subInfo[0].userId };
        const dbUser = await getUserInfoForAnalytics(subInfo[0].userId);
        if (dbUser) {
          userInfo = dbUser;
        }
      }
    }

    const mixpanelSafeEventProperties = userInfo.userId
      ? { ...eventProperties, user_id: userInfo.userId }
      : eventProperties;

    await sendAnalyticsEvent(
      eventName,
      userInfo,
      mixpanelSafeEventProperties,
      facebookCustomData,
      appId,
    );
  } catch (error) {
    console.error(
      `[WEBHOOK ${requestId}] ⚠️  Failed to track ${eventName} analytics:`,
      error,
    );
  }
}

async function getOrCreateOrderFromPayment(
  payment: any,
  requestId: string,
  targetStatus: string,
  eventTime: Date = new Date(),
) {
  const orderResult = await db
    .update(orders)
    .set({
      status: targetStatus as any,
      razorpayPaymentId: payment.id,
      paymentMetadata: payment,
      ...(payment.token_id ? { tokenId: payment.token_id } : {}),
      updatedAt: eventTime,
    })
    .where(eq(orders.razorpayOrderId, payment.order_id))
    .returning({ id: orders.id });

  if (orderResult.length > 0) {
    console.log(
      `[WEBHOOK ${requestId}] ✅ Order ${payment.order_id} updated to ${targetStatus}`,
    );
    return true;
  }

  console.log(
    `[WEBHOOK ${requestId}] ℹ️  Order ${payment.order_id} not found in DB. Attempting to create it...`,
  );

  let userIdToUse: string | null = null;
  let appIdToUse = "alertpay-default";

  // Single query: join user → subscriptions to get userId + appId in one shot
  if (payment.email) {
    const result = await db
      .select({
        userId: user.id,
        appId: subscriptions.appId,
      })
      .from(user)
      .leftJoin(subscriptions, eq(subscriptions.userId, user.id))
      .where(eq(user.email, payment.email))
      .limit(1);

    if (result.length > 0) {
      userIdToUse = result[0].userId;
      appIdToUse = result[0].appId ?? "alertpay-default";
    }
  }

  if (userIdToUse) {
    const newOrderId = crypto.randomBytes(4).toString("hex");
    try {
      await db.insert(orders).values({
        id: newOrderId,
        razorpayOrderId: payment.order_id,
        userId: userIdToUse,
        appId: appIdToUse,
        customerId: payment.email || payment.contact || "unknown",
        amount: payment.amount,
        currency: payment.currency || "INR",
        status: targetStatus as any,
        razorpayPaymentId: payment.id,
        paymentMetadata: payment,
        tokenId: payment.token_id || null,
        createdAt: eventTime,
        updatedAt: eventTime,
      });
      console.log(
        `[WEBHOOK ${requestId}] ✅ Order ${payment.order_id} created and set to ${targetStatus}`,
      );
      return true;
    } catch (err) {
      console.error(
        `[WEBHOOK ${requestId}] ❌ Failed to create order ${payment.order_id}:`,
        err,
      );
      return false;
    }
  } else {
    console.log(
      `[WEBHOOK ${requestId}] ⚠️ Could not create order ${payment.order_id}: user not found for ${payment.email || payment.contact}`,
    );
    return false;
  }
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const requestId = crypto.randomBytes(8).toString("hex");

  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature") || "";

    if (
      WEBHOOK_SECRET &&
      !verifyWebhookSignature(body, signature, WEBHOOK_SECRET)
    ) {
      console.error(`[WEBHOOK ${requestId}] ❌ Signature verification FAILED`);
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);
    const ids = extractWebhookIds(event);
    const eventTime = event.created_at
      ? new Date(event.created_at * 1000)
      : new Date();
    console.log(
      `[WEBHOOK ${requestId}] 🔔 Received ${ids.event} ${formatWebhookIds(ids)}`,
    );

    // Generic Subscription Webhook Logging
    if (ids.subscriptionId) {
      try {
        // We log every webhook that contains a subscription ID, so we have a full history
        const statusToLog = event.payload?.subscription?.entity?.status || null;

        let userIdToLog: string | null = null;
        let appIdToLog = "alertpay-default";

        const sub = await db
          .select({ userId: subscriptions.userId, appId: subscriptions.appId })
          .from(subscriptions)
          .where(
            eq(
              subscriptions.razorpaySubscriptionId,
              ids.subscriptionId as string,
            ),
          )
          .limit(1);

        if (sub.length > 0) {
          userIdToLog = sub[0].userId;
          appIdToLog = sub[0].appId;
        }

        await db.insert(subscriptionLogs).values({
          userId: userIdToLog,
          appId: appIdToLog,
          subscriptionId: ids.subscriptionId,
          provider: "razorpay",
          action: event.event,
          status: statusToLog,
          metadata: event,
        });
      } catch (logErr) {
        console.error(
          `[WEBHOOK ${requestId}] ⚠️ Failed to insert generic subscription log:`,
          logErr,
        );
      }
    }

    // Handle different webhook events
    switch (event.event) {
      case "payment.authorized":
        console.log(`[WEBHOOK ${requestId}] 💳 payment.authorized`, event);
        const authorizedPayment = event.payload.payment.entity;
        if (authorizedPayment.order_id && authorizedPayment.id) {
          console.log(
            `[WEBHOOK ${requestId}] 💳 payment.authorized paymentId=${authorizedPayment.id} orderId=${authorizedPayment.order_id}`,
          );
          // Try to create/update local order, but never block analytics on DB failures.
          try {
            await getOrCreateOrderFromPayment(
              authorizedPayment,
              requestId,
              ORDER_STATUS.AUTHORIZED,
              eventTime,
            );
          } catch (error) {
            console.error(
              `[WEBHOOK ${requestId}] ❌ Failed to upsert order for payment.authorized (paymentId=${authorizedPayment.id} orderId=${authorizedPayment.order_id}):`,
              error,
            );
          }

          // Always attempt analytics tracking, even if DB write failed.
          await trackOrderAnalytics(
            requestId,
            authorizedPayment.order_id,
            ANALYTICS_EVENTS.PAYMENT_AUTHORIZED,
            {
              payment_id: authorizedPayment.id,
              order_id: authorizedPayment.order_id,
              amount: authorizedPayment.amount / 100,
              currency: authorizedPayment.currency || "INR",
              method: authorizedPayment.method,
            },
          );

          // Fire Facebook standard Purchase for authorized payments and
          // deduplicate using the internal user order id.
          // await trackAuthorizedOrderFacebookPurchase(
          //   requestId,
          //   authorizedPayment.order_id,
          //   authorizedPayment,
          // );
        } else {
          console.warn(
            `[WEBHOOK ${requestId}] ⚠️  payment.authorized missing required IDs paymentId=${authorizedPayment?.id || "N/A"} orderId=${authorizedPayment?.order_id || "N/A"}`,
          );
        }
        break;

      case "payment.captured":
        const capturedPayment = event.payload.payment.entity;
        if (capturedPayment.order_id && capturedPayment.id) {
          console.log(
            `[WEBHOOK ${requestId}] 💰 payment.captured paymentId=${capturedPayment.id} orderId=${capturedPayment.order_id}`,
          );
          // Try to upsert order, but do not allow DB failures to block analytics.
          try {
            await getOrCreateOrderFromPayment(
              capturedPayment,
              requestId,
              ORDER_STATUS.CAPTURED,
              eventTime,
            );
          } catch (error) {
            console.error(
              `[WEBHOOK ${requestId}] ❌ Failed to upsert order for payment.captured (paymentId=${capturedPayment.id} orderId=${capturedPayment.order_id}):`,
              error,
            );
          }

          // Always attempt analytics tracking for captured payments.
          await trackOrderAnalytics(
            requestId,
            capturedPayment.order_id,
            ANALYTICS_EVENTS.PAYMENT_CAPTURED,
            {
              payment_id: capturedPayment.id,
              order_id: capturedPayment.order_id,
              amount: capturedPayment.amount / 100,
              currency: capturedPayment.currency || "INR",
              method: capturedPayment.method,
            },
          );
        } else {
          console.warn(
            `[WEBHOOK ${requestId}] ⚠️  payment.captured missing required IDs paymentId=${capturedPayment?.id || "N/A"} orderId=${capturedPayment?.order_id || "N/A"}`,
          );
        }
        break;

      case "payment.failed":
        const failedPayment = event.payload.payment.entity;
        if (!failedPayment.id) {
          console.warn(
            `[WEBHOOK ${requestId}] ⚠️  Missing payment id in failed event`,
          );
          break;
        }
        console.log(
          `[WEBHOOK ${requestId}] ❌ payment.failed paymentId=${failedPayment.id} orderId=${failedPayment.order_id || "N/A"} invoiceId=${failedPayment.invoice_id || "N/A"}`,
        );
        try {
          // Order payment: store in orders table (one-time or subscription setup)
          if (failedPayment.order_id) {
            // First, try to ensure local order exists, but swallow DB failures.
            try {
              await getOrCreateOrderFromPayment(
                failedPayment,
                requestId,
                ORDER_STATUS.FAILED,
                eventTime,
              );
            } catch (dbError) {
              console.error(
                `[WEBHOOK ${requestId}] ❌ Failed to upsert order for payment.failed (paymentId=${failedPayment.id} orderId=${failedPayment.order_id}):`,
                dbError,
              );
            }

            // Then always try analytics; internal try/catch in trackOrderAnalytics prevents crashes.
            await trackOrderAnalytics(
              requestId,
              failedPayment.order_id,
              ANALYTICS_EVENTS.PAYMENT_FAILED,
              {
                payment_id: failedPayment.id,
                order_id: failedPayment.order_id,
                amount: failedPayment.amount / 100,
                currency: failedPayment.currency || "INR",
                error_code: failedPayment.error_code,
                error_description: failedPayment.error_description,
              },
            );
          }
          // Subscription charge: store in subscriptions.metadata (invoice_id present = recurring charge)
          if (failedPayment.invoice_id) {
            try {
              const invoice = (await razorpay.invoices.fetch(
                failedPayment.invoice_id,
              )) as { subscription_id?: string };
              const subscriptionId = invoice.subscription_id;
              if (subscriptionId) {
                const sub = await db
                  .select({
                    id: subscriptions.id,
                    metadata: subscriptions.metadata,
                  })
                  .from(subscriptions)
                  .where(
                    eq(subscriptions.razorpaySubscriptionId, subscriptionId),
                  )
                  .limit(1);
                if (sub.length > 0) {
                  const prevMeta =
                    (sub[0].metadata as Record<string, unknown>) || {};
                  await db
                    .update(subscriptions)
                    .set({
                      metadata: {
                        ...prevMeta,
                        lastPaymentFailure: {
                          paymentId: failedPayment.id,
                          orderId: failedPayment.order_id,
                          invoiceId: failedPayment.invoice_id,
                          errorCode: failedPayment.error_code,
                          errorDescription: failedPayment.error_description,
                          errorReason: failedPayment.error_reason,
                          errorSource: failedPayment.error_source,
                          paymentMetadata: failedPayment,
                          failedAt: eventTime.toISOString(),
                        },
                      },
                      updatedAt: eventTime,
                    })
                    .where(
                      eq(subscriptions.razorpaySubscriptionId, subscriptionId),
                    );
                  console.log(
                    `[WEBHOOK ${requestId}] ✅ Subscription ${subscriptionId} metadata updated with payment failure`,
                  );
                }
              }
            } catch (subError) {
              console.error(
                `[WEBHOOK ${requestId}] ❌ Failed to update subscription metadata (paymentId=${failedPayment.id} invoiceId=${failedPayment.invoice_id}):`,
                subError,
              );
            }
          }
        } catch (error) {
          console.error(
            `[WEBHOOK ${requestId}] ❌ Failed to process payment failure (paymentId=${failedPayment.id}):`,
            error,
          );
        }
        break;

      case "token.confirmed":
        // Store token for recurring payments
        const tokenEntity = event.payload.token.entity;
        const tokenId = tokenEntity.id;
        const razorpayOrderId = tokenEntity.order_id;

        if (tokenId && razorpayOrderId) {
          console.log(
            `[WEBHOOK ${requestId}] 🎫 token.confirmed tokenId=${tokenId} orderId=${razorpayOrderId}`,
          );
          try {
            const orderResult = await db
              .update(orders)
              .set({
                tokenId: tokenId,
                updatedAt: eventTime,
              })
              .where(eq(orders.razorpayOrderId, razorpayOrderId))
              .returning({ id: orders.id });

            if (orderResult.length > 0) {
              console.log(
                `[WEBHOOK ${requestId}] ✅ Token ${tokenId} saved successfully`,
              );
            } else {
              console.log(
                `[WEBHOOK ${requestId}] ℹ️  Order ${razorpayOrderId} not found for token ${tokenId} (likely a subscription auto-generated order).`,
              );
            }

            // Track token confirmed event
            await trackOrderAnalytics(
              requestId,
              razorpayOrderId,
              ANALYTICS_EVENTS.TOKEN_CONFIRMED,
              {
                token_id: tokenId,
                order_id: razorpayOrderId,
              },
            );
          } catch (error) {
            console.error(
              `[WEBHOOK ${requestId}] ❌ Failed to save token (tokenId=${tokenId} orderId=${razorpayOrderId}):`,
              error,
            );
          }
        } else {
          console.warn(
            `[WEBHOOK ${requestId}] ⚠️  token.confirmed missing required IDs tokenId=${tokenId || "N/A"} orderId=${razorpayOrderId || "N/A"}`,
          );
        }
        break;

      case "token.rejected":
        const rejectedToken = event.payload.token.entity;
        if (rejectedToken.id && rejectedToken.order_id) {
          console.log(
            `[WEBHOOK ${requestId}] 🚫 token.rejected tokenId=${rejectedToken.id} orderId=${rejectedToken.order_id}`,
          );
          await trackOrderAnalytics(
            requestId,
            rejectedToken.order_id,
            ANALYTICS_EVENTS.TOKEN_REJECTED,
            {
              token_id: rejectedToken.id,
              order_id: rejectedToken.order_id,
            },
          );
        }
        break;

      case "token.paused":
        const pausedToken = event.payload.token.entity;
        if (pausedToken.id && pausedToken.order_id) {
          console.log(
            `[WEBHOOK ${requestId}] ⏸️  token.paused tokenId=${pausedToken.id} orderId=${pausedToken.order_id}`,
          );
          await trackOrderAnalytics(
            requestId,
            pausedToken.order_id,
            ANALYTICS_EVENTS.TOKEN_PAUSED,
            {
              token_id: pausedToken.id,
              order_id: pausedToken.order_id,
            },
          );
        }
        break;

      case "token.cancelled":
        const cancelledToken = event.payload.token.entity;
        if (cancelledToken.id && cancelledToken.order_id) {
          console.log(
            `[WEBHOOK ${requestId}] ❌ token.cancelled tokenId=${cancelledToken.id} orderId=${cancelledToken.order_id}`,
          );
          await trackOrderAnalytics(
            requestId,
            cancelledToken.order_id,
            ANALYTICS_EVENTS.TOKEN_CANCELLED,
            {
              token_id: cancelledToken.id,
              order_id: cancelledToken.order_id,
            },
          );
        }
        break;

      // Subscription events
      case "subscription.activated":
        const activatedSub = event.payload.subscription.entity;
        if (activatedSub.id) {
          console.log(
            `[WEBHOOK ${requestId}] 🎉 subscription.activated subscriptionId=${activatedSub.id}`,
          );
          try {
            await db
              .update(subscriptions)
              .set({
                status: "active",
                startAt: activatedSub.start_at
                  ? new Date(activatedSub.start_at * 1000)
                  : null,
                endAt: activatedSub.end_at
                  ? new Date(activatedSub.end_at * 1000)
                  : null,
                currentStart: activatedSub.current_start
                  ? new Date(activatedSub.current_start * 1000)
                  : null,
                currentEnd: activatedSub.current_end
                  ? new Date(activatedSub.current_end * 1000)
                  : null,
                chargeAt: activatedSub.charge_at
                  ? new Date(activatedSub.charge_at * 1000)
                  : null,
                totalCount: activatedSub.total_count,
                paidCount: activatedSub.paid_count,
                remainingCount: activatedSub.remaining_count,
                metadata: activatedSub,
                updatedAt: eventTime,
              })
              .where(eq(subscriptions.razorpaySubscriptionId, activatedSub.id));
            console.log(
              `[WEBHOOK ${requestId}] ✅ Subscription ${activatedSub.id} activated successfully`,
            );

            // Track subscription activated event
            await trackSubscriptionAnalytics(
              requestId,
              activatedSub.id,
              ANALYTICS_EVENTS.SUBSCRIPTION_ACTIVATED,
              {
                subscription_id: activatedSub.id,
                plan_id: activatedSub.plan_id,
                quantity: activatedSub.quantity,
              },
            );
          } catch (error) {
            console.error(
              `[WEBHOOK ${requestId}] ❌ Failed to activate subscription:`,
              error,
            );
          }
        } else {
          console.warn(
            `[WEBHOOK ${requestId}] ⚠️  Missing subscription id in activated event`,
          );
        }
        break;

      case "subscription.charged":
        const chargedSub = event.payload.subscription.entity;
        if (chargedSub.id) {
          const chargedInvoiceId = chargedSub.latest_invoice?.id;
          console.log(
            `[WEBHOOK ${requestId}] 💵 subscription.charged subscriptionId=${chargedSub.id}${chargedInvoiceId ? ` invoiceId=${chargedInvoiceId}` : ""}`,
          );
          try {
            const paidCount = chargedSub.paid_count || 0;
            const remainingCount = chargedSub.remaining_count;
            // console.log(`[WEBHOOK ${requestId}] 🔄 Updating billing info for subscription ${chargedSub.id}...`);
            await db
              .update(subscriptions)
              .set({
                status: chargedSub.status || "active",
                startAt: chargedSub.start_at
                  ? new Date(chargedSub.start_at * 1000)
                  : null,
                endAt: chargedSub.end_at
                  ? new Date(chargedSub.end_at * 1000)
                  : null,
                currentStart: chargedSub.current_start
                  ? new Date(chargedSub.current_start * 1000)
                  : null,
                currentEnd: chargedSub.current_end
                  ? new Date(chargedSub.current_end * 1000)
                  : null,
                chargeAt: chargedSub.charge_at
                  ? new Date(chargedSub.charge_at * 1000)
                  : null,
                totalCount: chargedSub.total_count,
                paidCount: paidCount,
                remainingCount: remainingCount,
                metadata: chargedSub,
                updatedAt: eventTime,
              })
              .where(eq(subscriptions.razorpaySubscriptionId, chargedSub.id));
            console.log(
              `[WEBHOOK ${requestId}] ✅ Subscription ${chargedSub.id} billing info updated`,
            );

            // Track subscription charged event
            const paymentEntity = event.payload.payment?.entity;
            const paymentAmount = paymentEntity?.amount
              ? paymentEntity.amount / 100
              : undefined;

            await trackSubscriptionAnalytics(
              requestId,
              chargedSub.id,
              ANALYTICS_EVENTS.SUBSCRIPTION_CHARGED,
              {
                subscription_id: chargedSub.id,
                paid_count: paidCount,
                remaining_count: remainingCount,
                amount: paymentAmount,
                currency: paymentEntity?.currency || "INR",
              },
            );
          } catch (error) {
            console.error(
              `[WEBHOOK ${requestId}] ❌ Failed to update subscription billing info:`,
              error,
            );
          }
        } else {
          console.warn(
            `[WEBHOOK ${requestId}] ⚠️  Missing subscription id in charged event`,
          );
        }
        break;

      case "subscription.pending":
        const pendingSub = event.payload.subscription.entity;
        if (pendingSub.id) {
          console.log(
            `[WEBHOOK ${requestId}] ⏳ subscription.pending subscriptionId=${pendingSub.id}`,
          );
          try {
            // console.log(`[WEBHOOK ${requestId}] 🔄 Setting subscription ${pendingSub.id} to pending...`);
            await db
              .update(subscriptions)
              .set({
                status: "pending",
                startAt: pendingSub.start_at
                  ? new Date(pendingSub.start_at * 1000)
                  : null,
                endAt: pendingSub.end_at
                  ? new Date(pendingSub.end_at * 1000)
                  : null,
                currentStart: pendingSub.current_start
                  ? new Date(pendingSub.current_start * 1000)
                  : null,
                currentEnd: pendingSub.current_end
                  ? new Date(pendingSub.current_end * 1000)
                  : null,
                chargeAt: pendingSub.charge_at
                  ? new Date(pendingSub.charge_at * 1000)
                  : null,
                totalCount: pendingSub.total_count,
                paidCount: pendingSub.paid_count,
                remainingCount: pendingSub.remaining_count,
                metadata: pendingSub,
                updatedAt: eventTime,
              })
              .where(eq(subscriptions.razorpaySubscriptionId, pendingSub.id));
            console.log(
              `[WEBHOOK ${requestId}] ✅ Subscription ${pendingSub.id} set to pending`,
            );

            // Track subscription pending event
            await trackSubscriptionAnalytics(
              requestId,
              pendingSub.id,
              ANALYTICS_EVENTS.SUBSCRIPTION_PENDING,
              {
                subscription_id: pendingSub.id,
                plan_id: pendingSub.plan_id,
              },
            );
          } catch (error) {
            console.error(
              `[WEBHOOK ${requestId}] ❌ Failed to update subscription to pending:`,
              error,
            );
          }
        } else {
          console.warn(
            `[WEBHOOK ${requestId}] ⚠️  Missing subscription id in pending event`,
          );
        }
        break;

      case "subscription.halted":
      case "subscription.paused":
        const haltedSub = event.payload.subscription.entity;
        if (haltedSub.id) {
          try {
            // console.log(`[WEBHOOK ${requestId}] 🔄 Halting subscription ${haltedSub.id}...`);
            await db
              .update(subscriptions)
              .set({
                status: "halted",
                startAt: haltedSub.start_at
                  ? new Date(haltedSub.start_at * 1000)
                  : null,
                endAt: haltedSub.end_at
                  ? new Date(haltedSub.end_at * 1000)
                  : null,
                currentStart: haltedSub.current_start
                  ? new Date(haltedSub.current_start * 1000)
                  : null,
                currentEnd: haltedSub.current_end
                  ? new Date(haltedSub.current_end * 1000)
                  : null,
                chargeAt: haltedSub.charge_at
                  ? new Date(haltedSub.charge_at * 1000)
                  : null,
                totalCount: haltedSub.total_count,
                paidCount: haltedSub.paid_count,
                remainingCount: haltedSub.remaining_count,
                metadata: haltedSub,
                updatedAt: eventTime,
              })
              .where(eq(subscriptions.razorpaySubscriptionId, haltedSub.id));
            console.log(
              `[WEBHOOK ${requestId}] ✅ Subscription ${haltedSub.id} halted`,
            );

            // Track subscription halted/paused event
            const eventName =
              event.event === "subscription.paused"
                ? ANALYTICS_EVENTS.SUBSCRIPTION_PAUSED
                : ANALYTICS_EVENTS.SUBSCRIPTION_HALTED;
            await trackSubscriptionAnalytics(
              requestId,
              haltedSub.id,
              eventName,
              {
                subscription_id: haltedSub.id,
                plan_id: haltedSub.plan_id,
              },
            );
          } catch (error) {
            console.error(
              `[WEBHOOK ${requestId}] ❌ Failed to halt subscription:`,
              error,
            );
          }
        } else {
          console.warn(
            `[WEBHOOK ${requestId}] ⚠️  Missing subscription id in halted/paused event`,
          );
        }
        break;

      case "subscription.resumed":
        const resumedSub = event.payload.subscription.entity;
        if (resumedSub.id) {
          try {
            // console.log(`[WEBHOOK ${requestId}] 🔄 Resuming subscription ${resumedSub.id}...`);
            await db
              .update(subscriptions)
              .set({
                status: "active",
                startAt: resumedSub.start_at
                  ? new Date(resumedSub.start_at * 1000)
                  : null,
                endAt: resumedSub.end_at
                  ? new Date(resumedSub.end_at * 1000)
                  : null,
                currentStart: resumedSub.current_start
                  ? new Date(resumedSub.current_start * 1000)
                  : null,
                currentEnd: resumedSub.current_end
                  ? new Date(resumedSub.current_end * 1000)
                  : null,
                chargeAt: resumedSub.charge_at
                  ? new Date(resumedSub.charge_at * 1000)
                  : null,
                totalCount: resumedSub.total_count,
                paidCount: resumedSub.paid_count,
                remainingCount: resumedSub.remaining_count,
                metadata: resumedSub,
                updatedAt: eventTime,
              })
              .where(eq(subscriptions.razorpaySubscriptionId, resumedSub.id));
            console.log(
              `[WEBHOOK ${requestId}] ✅ Subscription ${resumedSub.id} resumed`,
            );

            // Track subscription resumed event
            await trackSubscriptionAnalytics(
              requestId,
              resumedSub.id,
              ANALYTICS_EVENTS.SUBSCRIPTION_RESUMED,
              {
                subscription_id: resumedSub.id,
                plan_id: resumedSub.plan_id,
              },
            );
          } catch (error) {
            console.error(
              `[WEBHOOK ${requestId}] ❌ Failed to resume subscription:`,
              error,
            );
          }
        } else {
          console.warn(
            `[WEBHOOK ${requestId}] ⚠️  Missing subscription id in resumed event`,
          );
        }
        break;

      case "subscription.cancelled":
        const cancelledSub = event.payload.subscription.entity;
        if (cancelledSub.id) {
          try {
            // Fetch subscription start time for 24h grace period calculation
            const subRecord = await db
              .select({
                startAt: subscriptions.startAt,
                createdAt: subscriptions.createdAt,
              })
              .from(subscriptions)
              .where(eq(subscriptions.razorpaySubscriptionId, cancelledSub.id))
              .limit(1);

            const now = eventTime;
            const subStart =
              subRecord[0]?.startAt ?? subRecord[0]?.createdAt ?? now;
            const gracePeriodEnd = new Date(
              subStart.getTime() + 24 * 60 * 60 * 1000,
            );
            const effectiveEndAt = gracePeriodEnd > now ? gracePeriodEnd : now;

            await db
              .update(subscriptions)
              .set({
                status: "cancelled",
                endAt: effectiveEndAt,
                startAt: cancelledSub.start_at
                  ? new Date(cancelledSub.start_at * 1000)
                  : null,
                currentStart: cancelledSub.current_start
                  ? new Date(cancelledSub.current_start * 1000)
                  : null,
                currentEnd: cancelledSub.current_end
                  ? new Date(cancelledSub.current_end * 1000)
                  : null,
                chargeAt: cancelledSub.charge_at
                  ? new Date(cancelledSub.charge_at * 1000)
                  : null,
                totalCount: cancelledSub.total_count,
                paidCount: cancelledSub.paid_count,
                remainingCount: cancelledSub.remaining_count,
                fourHourEventSent: true, // Mark as sent to prevent 4-hour event
                metadata: cancelledSub,
                updatedAt: now,
              })
              .where(eq(subscriptions.razorpaySubscriptionId, cancelledSub.id));

            const subscription = await db
              .select({
                userId: subscriptions.userId,
                customerId: subscriptions.customerId,
              })
              .from(subscriptions)
              .where(eq(subscriptions.razorpaySubscriptionId, cancelledSub.id))
              .limit(1);

            if (subscription.length > 0) {
              await trackSubscriptionAnalytics(
                requestId,
                cancelledSub.id,
                ANALYTICS_EVENTS.SUBSCRIPTION_CANCELLED,
                {
                  subscription_id: cancelledSub.id,
                  customer_id: subscription[0].customerId,
                },
                {
                  subscription_id: cancelledSub.id,
                  customer_id: subscription[0].customerId,
                },
              );
            } else {
              console.warn(
                `[WEBHOOK ${requestId}] ⚠️  Subscription record not found for ${cancelledSub.id}`,
              );
            }
          } catch (error) {
            console.error(
              `[WEBHOOK ${requestId}] ❌ Failed to process subscription cancellation:`,
              error,
            );
          }
        } else {
          console.warn(
            `[WEBHOOK ${requestId}] ⚠️  Missing subscription id in cancelled event`,
          );
        }
        break;

      case "subscription.completed":
        const completedSub = event.payload.subscription.entity;
        if (completedSub.id) {
          try {
            await db
              .update(subscriptions)
              .set({
                status: "completed",
                startAt: completedSub.start_at
                  ? new Date(completedSub.start_at * 1000)
                  : null,
                endAt: completedSub.ended_at
                  ? new Date(completedSub.ended_at * 1000)
                  : eventTime,
                currentStart: completedSub.current_start
                  ? new Date(completedSub.current_start * 1000)
                  : null,
                currentEnd: completedSub.current_end
                  ? new Date(completedSub.current_end * 1000)
                  : null,
                chargeAt: completedSub.charge_at
                  ? new Date(completedSub.charge_at * 1000)
                  : null,
                totalCount: completedSub.total_count,
                paidCount: completedSub.paid_count,
                remainingCount: completedSub.remaining_count,
                metadata: completedSub,
                updatedAt: eventTime,
              })
              .where(eq(subscriptions.razorpaySubscriptionId, completedSub.id));

            // Track subscription completed event
            await trackSubscriptionAnalytics(
              requestId,
              completedSub.id,
              ANALYTICS_EVENTS.SUBSCRIPTION_COMPLETED,
              {
                subscription_id: completedSub.id,
                plan_id: completedSub.plan_id,
                total_count: completedSub.total_count,
              },
            );
          } catch (error) {
            console.error(
              `[WEBHOOK ${requestId}] ❌ Failed to complete subscription:`,
              error,
            );
          }
        } else {
          console.warn(
            `[WEBHOOK ${requestId}] ⚠️  Missing subscription id in completed event`,
          );
        }
        break;

      case "subscription.authenticated":
        const authenticatedSub = event.payload.subscription.entity;
        if (authenticatedSub.id) {
          try {
            // Check current subscription status before updating
            const existingSubscription = await db
              .select({ status: subscriptions.status })
              .from(subscriptions)
              .where(
                eq(subscriptions.razorpaySubscriptionId, authenticatedSub.id),
              )
              .limit(1);

            if (
              existingSubscription.length > 0 &&
              existingSubscription[0].status === "active"
            ) {
              console.log(
                `[WEBHOOK ${requestId}] ⏭️  Skipping authenticated update - subscription ${authenticatedSub.id} is already active`,
              );
              break;
            }

            await db
              .update(subscriptions)
              .set({
                status: "authenticated",
                startAt: authenticatedSub.start_at
                  ? new Date(authenticatedSub.start_at * 1000)
                  : null,
                endAt: authenticatedSub.end_at
                  ? new Date(authenticatedSub.end_at * 1000)
                  : null,
                currentStart: authenticatedSub.current_start
                  ? new Date(authenticatedSub.current_start * 1000)
                  : null,
                currentEnd: authenticatedSub.current_end
                  ? new Date(authenticatedSub.current_end * 1000)
                  : null,
                chargeAt: authenticatedSub.charge_at
                  ? new Date(authenticatedSub.charge_at * 1000)
                  : null,
                totalCount: authenticatedSub.total_count,
                paidCount: authenticatedSub.paid_count,
                remainingCount: authenticatedSub.remaining_count,
                metadata: authenticatedSub,
                updatedAt: eventTime,
              })
              .where(
                eq(subscriptions.razorpaySubscriptionId, authenticatedSub.id),
              );
            console.log(
              `[WEBHOOK ${requestId}] ✅ Subscription ${authenticatedSub.id} updated to authenticated`,
            );

            // Track subscription authenticated event
            await trackSubscriptionAnalytics(
              requestId,
              authenticatedSub.id,
              ANALYTICS_EVENTS.SUBSCRIPTION_AUTHENTICATED,
              {
                subscription_id: authenticatedSub.id,
                plan_id: authenticatedSub.plan_id,
                total_count: authenticatedSub.total_count,
                remaining_count: authenticatedSub.remaining_count,
              },
            );
          } catch (error) {
            console.error(
              `[WEBHOOK ${requestId}] ❌ Failed to update subscription to authenticated:`,
              error,
            );
          }
        } else {
          console.warn(
            `[WEBHOOK ${requestId}] ⚠️  Missing subscription id in authenticated event`,
          );
        }
        break;

      case "order.paid":
        const paidOrder = event.payload.order.entity;
        if (paidOrder.id) {
          console.log(
            `[WEBHOOK ${requestId}] 💰 order.paid orderId=${paidOrder.id}`,
          );
          try {
            // console.log(`[WEBHOOK ${requestId}] 🔄 Updating order ${paidOrder.id} to CAPTURED status (if not already)...`);
            // Update order to captured if it's not already captured
            // This handles cases where order.paid arrives before or instead of payment.captured
            const existingOrder = await db
              .select({
                status: orders.status,
                userId: orders.userId,
                amount: orders.amount,
              })
              .from(orders)
              .where(eq(orders.razorpayOrderId, paidOrder.id))
              .limit(1);

            if (
              existingOrder.length > 0 &&
              existingOrder[0].status !== "captured"
            ) {
              await db
                .update(orders)
                .set({
                  status: ORDER_STATUS.CAPTURED,
                  updatedAt: eventTime,
                })
                .where(eq(orders.razorpayOrderId, paidOrder.id));
              console.log(
                `[WEBHOOK ${requestId}] ✅ Order ${paidOrder.id} updated to CAPTURED`,
              );

              // Track order paid event
              if (existingOrder[0].userId) {
                // Razorpay amounts are in paise; orders.amount is also in paise
                const amountInRupees =
                  paidOrder.amount != null
                    ? paidOrder.amount / 100
                    : (existingOrder[0].amount ?? 0) / 100;
                await trackOrderAnalytics(
                  requestId,
                  paidOrder.id,
                  ANALYTICS_EVENTS.ORDER_PAID,
                  {
                    order_id: paidOrder.id,
                    amount: amountInRupees,
                    currency: paidOrder.currency || "INR",
                    amount_paid: paidOrder.amount_paid
                      ? paidOrder.amount_paid / 100
                      : undefined,
                  },
                );
              }
            } else {
              console.log(
                `[WEBHOOK ${requestId}] ℹ️  Order ${paidOrder.id} already in final state, skipping update`,
              );
            }
          } catch (error) {
            console.error(
              `[WEBHOOK ${requestId}] ❌ Failed to update order to captured:`,
              error,
            );
          }
        } else {
          console.warn(
            `[WEBHOOK ${requestId}] ⚠️  Missing order id in order.paid event`,
          );
        }
        break;

      default:
        console.log(
          `[WEBHOOK ${requestId}] ⚠️  Unhandled event type: ${event.event} ${formatWebhookIds(ids)}`,
        );
    }

    const processingTime = Date.now() - startTime;
    console.log(
      `[WEBHOOK ${requestId}] ✅ Webhook processed successfully in ${processingTime}ms`,
    );

    return NextResponse.json({ received: true });
  } catch (error) {
    const processingTime = Date.now() - startTime;
    console.error(
      `[WEBHOOK ${requestId}] ❌ Webhook error after ${processingTime}ms:`,
      error,
    );

    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 },
    );
  }
}

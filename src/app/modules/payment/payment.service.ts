import Stripe from "stripe";
import config from "../../config/env";
import prisma from "../../lib/prisma";
import AppError from "../../shared/errors/app-error";
import HttpStatus from "../../shared/constants/http-status";
import { logger } from "../../shared/logger/logger";

const stripe = new Stripe(config.stripe.secretKey);

export class PaymentService {
  static async createSubscriptionSession(
    userId: string,
    plan: "monthly" | "yearly",
  ) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user)
      throw new AppError("User not found", HttpStatus.NOT_FOUND, "NOT_FOUND");

    let customerId = user.stripeCustomerId;

    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        metadata: { userId: user.id },
      });
      customerId = customer.id;
      await prisma.user.update({
        where: { id: userId },
        data: { stripeCustomerId: customerId },
      });
    }

    const priceIdOrAmount =
      plan === "yearly"
        ? config.stripe.priceYearly
        : config.stripe.priceMonthly;

    // Check if it's a real Stripe Price ID or an amount like "20$"
    const isPriceId = priceIdOrAmount.startsWith("price_");

    const lineItem = isPriceId
      ? { price: priceIdOrAmount, quantity: 1 }
      : {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Code Arena Premium - ${plan.charAt(0).toUpperCase() + plan.slice(1)}`,
            },
            unit_amount: parseInt(priceIdOrAmount.replace(/[^0-9]/g, "")) * 100, // Handle '20$' -> 2000
            recurring: { interval: plan === "yearly" ? "year" : "month" },
          },
          quantity: 1,
        };

    const domainUrl = process.env.CLIENT_URL || "http://localhost:3000";
    const backendUrl =
      process.env.API_BASE_URL || "http://localhost:8080/api/v1";

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [lineItem as any],
      // Redirect user DIRECTLY to backend so it guarantees database save before frontend
      success_url: `${backendUrl}/payment/verify-redirect?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${domainUrl}/payment-cancel`,
      metadata: { userId: user.id, plan },
    });

    return { sessionId: session.id, url: session.url };
  }

  static async verifySession(sessionId: string) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      logger.info(
        `Verify session: id=${sessionId}, payment_status=${session.payment_status}, status=${session.status}`,
      );

      if (session.payment_status === "paid" || session.status === "complete") {
        const customerId = session.customer as string;
        const metadataUserId = session.metadata?.userId;
        const plan = (session.metadata?.plan as string) || "monthly";

        // Find the user - try stripeCustomerId first, then metadata userId
        let user = customerId
          ? await prisma.user.findFirst({
              where: { stripeCustomerId: customerId },
            })
          : null;

        if (!user && metadataUserId) {
          user = await prisma.user.findUnique({
            where: { id: metadataUserId },
          });
          // Link the stripe customer ID if found via metadata
          if (user && customerId) {
            await prisma.user.update({
              where: { id: user.id },
              data: { stripeCustomerId: customerId },
            });
          }
        }

        logger.info(
          `Verify session: user found = ${!!user}, userId = ${user?.id || metadataUserId || "unknown"}`,
        );

        if (user) {
          await prisma.user.update({
            where: { id: user.id },
            data: {
              isPremium: true,
              subscriptionStatus: "active",
              subscriptionPlan: plan,
            },
          });

          // Save payment record
          const amount =
            session.amount_total || (plan === "yearly" ? 10000 : 2000);
          const data = await prisma.payment.upsert({
            where: { stripeSessionId: sessionId },
            update: {},
            create: {
              userId: user.id,
              amount,
              currency: session.currency || "usd",
              plan,
              status: "completed",
              stripeSessionId: sessionId,
              stripeSubscriptionId: (session.subscription as string) || null,
            },
          });

          logger.info(`Payment record upserted: ${data}`);

          logger.info(
            `Payment record saved for user ${user.id}, amount=${amount}, plan=${plan}`,
          );
        }

        return { verified: true, status: "active" };
      }
      return { verified: false, status: session.status };
    } catch (error) {
      logger.error("Error verifying payment session natively:", error);
      return { verified: false, error: "Failed to verify session" };
    }
  }

  static async handleWebhook(signature: string, rawBody: Buffer) {
    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(
        rawBody,
        signature,
        config.stripe.webhookSecret,
      );
    } catch (err: any) {
      logger.error(`Webhook signature verification failed:  ${err.message}`);
      throw new AppError(
        `Webhook Error: ${err.message}`,
        HttpStatus.BAD_REQUEST,
        "WEBHOOK_ERROR",
      );
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          if (session.mode === "subscription") {
            const customerId = session.customer as string;
            const user = await prisma.user.findFirst({
              where: { stripeCustomerId: customerId },
            });
            await prisma.user.updateMany({
              where: { stripeCustomerId: customerId },
              data: {
                isPremium: true,
                subscriptionStatus: "active",
              },
            });

            // Save payment record via webhook
            if (user && session.id) {
              const plan = (session.metadata?.plan as string) || "monthly";
              const amount =
                session.amount_total || (plan === "yearly" ? 10000 : 2000);
              await prisma.payment.upsert({
                where: { stripeSessionId: session.id },
                update: {},
                create: {
                  userId: user.id,
                  amount,
                  currency: session.currency || "usd",
                  plan,
                  status: "completed",
                  stripeSessionId: session.id,
                  stripeSubscriptionId:
                    (session.subscription as string) || null,
                },
              });
            }
          }
          break;
        }
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as any;
          const status = subscription.status;
          const currentPeriodEnd = new Date(
            subscription.current_period_end * 1000,
          );

          await prisma.user.update({
            where: { stripeCustomerId: subscription.customer as string },
            data: {
              isPremium: status === "active" || status === "trialing",
              subscriptionStatus: status,
              currentPeriodEnd,
            },
          });
          break;
        }
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          if (invoice.customer) {
            await prisma.user.update({
              where: { stripeCustomerId: invoice.customer as string },
              data: {
                isPremium: false,
                subscriptionStatus: "past_due",
              },
            });
          }
          break;
        }
        default:
          logger.info(`Unhandled Stripe event type ${event.type}`);
      }
    } catch (err) {
      logger.error(`Error processing webhook event ${event.type}`, err);
    }

    return { received: true };
  }
}

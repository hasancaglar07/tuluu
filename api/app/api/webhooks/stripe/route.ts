import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { buffer } from "node:stream/consumers";
import { clerkClient } from "@clerk/nextjs/server";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

/**
 * @swagger
 * /api/webhooks/stripe:
 *   post:
 *     summary: Stripe webhook endpoint to handle subscription events.
 *     description: |
 *       Handles Stripe webhook events including invoice payments and subscription deletions.
 *       Updates corresponding Clerk user metadata based on Stripe event type.
 *     tags:
 *       - Webhooks
 *     requestBody:
 *       description: Raw Stripe event payload. The request must be verified with the Stripe signature.
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             example:
 *               id: evt_1Example
 *               object: event
 *               type: invoice.paid
 *     responses:
 *       200:
 *         description: Event processed successfully.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 received:
 *                   type: boolean
 *                   example: true
 *       400:
 *         description: Webhook error or bad request (missing user, email, etc.)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: No user found
 *     security:
 *       - webhookSignature: []
 */

/**
 * @swagger
 * components:
 *   securitySchemes:
 *     webhookSignature:
 *       type: apiKey
 *       in: header
 *       name: stripe-signature
 */

export async function POST(req: NextRequest) {
  // 👇 Fix: Assert non-null for req.body
  const rawBody = await buffer(req.body as unknown as NodeJS.ReadableStream);
  const sig = req.headers.get("stripe-signature");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, sig!, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return new NextResponse(`Webhook Error: ${err}`, { status: 400 });
  }

  // ✅ Handle event types
  switch (event.type) {
    case "invoice.paid":
      const invoice = event.data.object as Stripe.Invoice;

      const customerId = invoice.customer as string;
      const customer = (await stripe.customers.retrieve(
        customerId
      )) as Stripe.Customer;

      const email = customer.email;
      if (!email) {
        console.error("Stripe customer has no email");
        return NextResponse.json(
          { error: "No email on customer" },
          { status: 400 }
        );
      }
      const clerkAwait = await clerkClient();
      const users = await clerkAwait.users.getUserList({
        emailAddress: [email],
      });

      const user = users.data[0];
      if (!user) {
        return NextResponse.json({ error: "No user found" }, { status: 400 });
      }
      try {
        const existingUser = await clerkAwait.users.getUser(user.id);

        // Update the user's private metadata
        await clerkAwait.users.updateUser(user.id, {
          privateMetadata: {
            ...existingUser.privateMetadata,
            subscription: "premium",
            subscriptionStatus: "active",
            paidAt: invoice.status_transitions?.paid_at || Date.now(),
            invoice: invoice,
          },
        });
      } catch (err) {
        console.error("Failed to update Clerk user:", err);
      }
      break;

    case "customer.subscription.deleted":
      const subscription = event.data.object as Stripe.Subscription;

      try {
        const customerId = subscription.customer as string;
        const customer = (await stripe.customers.retrieve(
          customerId
        )) as Stripe.Customer;

        const email = customer.email;
        if (!email) {
          console.error("Stripe customer has no email");
          return NextResponse.json(
            { error: "No email on customer" },
            { status: 400 }
          );
        }

        const clerk = await clerkClient();
        const users = await clerk.users.getUserList({
          emailAddress: [email],
        });

        const user = users.data[0];
        if (!user) {
          return NextResponse.json({ error: "No user found" }, { status: 400 });
        }
        const clerkAwait = await clerkClient();
        const existingUser = await clerkAwait.users.getUser(user.id);

        await clerk.users.updateUser(user.id, {
          privateMetadata: {
            ...existingUser.privateMetadata,
            subscription: "free",
            subscriptionStatus: "cancelled",
            cancelledAt: subscription.canceled_at || Date.now(),
            subscriptionDetail: subscription,
          },
        });

        console.log(
          `Subscription for ${email} cancelled and Clerk metadata updated.`
        );
      } catch (err) {
        console.error("Failed to handle subscription deletion:", err);
      }
      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ received: true });
}

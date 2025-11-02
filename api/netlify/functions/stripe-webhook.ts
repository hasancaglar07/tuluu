import Stripe from "stripe";
import { buffer } from "node:stream/consumers";
import { clerkClient } from "@clerk/nextjs/server";
import type { Handler } from "@netlify/functions";

// Stripe setup
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-05-28.basil",
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export const handler: Handler = async (event, context) => {
  const sig = event.headers["stripe-signature"];
  let stripeEvent: Stripe.Event;

  try {
    // Parse raw body correctly
    const rawBody = event.body;
    if (!rawBody || !sig) {
      return { statusCode: 400, body: "Missing body or signature" };
    }

    stripeEvent = stripe.webhooks.constructEvent(rawBody, sig, endpointSecret);
  } catch (err) {
    console.error("❌ Webhook Error:", err);
    return {
      statusCode: 400,
      body: `Webhook Error: ${
        err instanceof Error ? err.message : String(err)
      }`,
    };
  }

  // Handle webhook events
  try {
    switch (stripeEvent.type) {
      case "invoice.paid": {
        const invoice = stripeEvent.data.object as Stripe.Invoice;
        const customerId = invoice.customer as string;
        const customer = (await stripe.customers.retrieve(
          customerId
        )) as Stripe.Customer;

        const email = customer.email;
        if (!email) {
          console.error("Stripe customer has no email");
          return { statusCode: 400, body: "No email on customer" };
        }

        const clerk = await clerkClient();
        const users = await clerk.users.getUserList({
          emailAddress: [email],
        });

        const user = users.data[0];
        if (!user) {
          return { statusCode: 400, body: "No user found" };
        }

        const existingUser = await clerk.users.getUser(user.id);

        await clerk.users.updateUser(user.id, {
          privateMetadata: {
            ...existingUser.privateMetadata,
            subscription: "premium",
            subscriptionStatus: "active",
            paidAt: invoice.status_transitions?.paid_at || Date.now(),
            invoice: invoice,
          },
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = stripeEvent.data.object as Stripe.Subscription;
        const customerId = subscription.customer as string;
        const customer = (await stripe.customers.retrieve(
          customerId
        )) as Stripe.Customer;

        const email = customer.email;
        if (!email) {
          console.error("Stripe customer has no email");
          return { statusCode: 400, body: "No email on customer" };
        }

        const clerk = await clerkClient();
        const users = await clerk.users.getUserList({
          emailAddress: [email],
        });

        const user = users.data[0];
        if (!user) {
          return { statusCode: 400, body: "No user found" };
        }

        const existingUser = await clerk.users.getUser(user.id);

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
        break;
      }

      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }

    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (err) {
    console.error("Processing error:", err);
    return { statusCode: 500, body: "Internal Server Error" };
  }
};

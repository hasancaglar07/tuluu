import { auth, clerkClient } from "@clerk/nextjs/server";

// Define a type for the subscription data if you have a known shape
type SubscriptionType = string | null | undefined;

/**
 * Fetches the current user's subscription information from Clerk.
 *
 * @returns The user's subscription info from private metadata.
 * @throws Error if the user is not authenticated.
 */
export async function getSubscription(): Promise<SubscriptionType> {
  // Retrieve the currently authenticated user's ID
  const { userId } = await auth();

  // If userId is not available, the user is not authenticated
  if (!userId) {
    throw new Error("Unauthorized: User is not authenticated.");
  }

  // Initialize the Clerk client to access user information
  const clerk = await clerkClient();

  // Fetch full user object from Clerk using the userId
  const user = await clerk.users.getUser(userId);

  // Safely access the subscription stored in user's private metadata
  const subscription = user.privateMetadata?.subscription as SubscriptionType;

  return subscription;
}

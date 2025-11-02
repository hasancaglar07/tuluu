// app/actions/getSubscription.ts
import { Subscription } from "@/types";
import { auth, clerkClient } from "@clerk/nextjs/server";

export async function getSubscription(): Promise<Subscription> {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  // Access privateMetadata here safely
  const subscription = user.privateMetadata as Subscription;

  return subscription;
}

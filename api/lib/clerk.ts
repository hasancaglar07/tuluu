import connectDB from "@/lib/db/connect";
import { clerkClient } from "@clerk/nextjs/server";
import { generateRandomUsername } from "./utils";
import type { SubscriptionType, ClerkUser, UserRole } from "@/types";
import User from "@/models/User";
import isEqual from "lodash.isequal"; // Use lodash for deep comparison

/**
 * Syncs a user from Clerk to our MongoDB database
 */
export async function syncUserWithClerk(data: ClerkUser) {
  try {
    await connectDB();

    const {
      id,
      email_addresses,
      first_name,
      last_name,
      image_url,
      xp,
      status,
      gems,
      gel,
      hearts,
      streak,
      subscription,
      role,
    } = data;

    try {
      const user = await User.create({
        clerkId: id,
        xp: xp ?? 0,
        gems: gems ?? 0,
        gel: gel ?? 0,
        hearts: hearts ?? 5,
        streak: streak ?? 0,
      });
      console.log(`User ${user} synced with Clerk successfully.`);
      // return user;
    } catch (error) {
      console.error("Failed to create user:", error);
      throw error;
    }

    const primaryEmail = email_addresses.find(
      (email: { id: string }) => email.id === data.primary_email_address_id
    );
    const emailAddress = primaryEmail ? primaryEmail.email_address : null;

    const clerkAwait = await clerkClient(); // 👈 await h
    const clerk = await clerkAwait.users.getUser(id);

    const newPublicMetadata = {
      name: `${last_name} ${first_name}`,
      email: emailAddress,
      userName: clerk.publicMetadata?.userName || generateRandomUsername(),
      avatar:
        image_url || "https://cdn-icons-png.flaticon.com/128/4322/4322991.png",
      country: "US", // avoid navigator in backend
      timezone: "UTC",
      settings: {
        notifications: {
          dailyReminder: false,
          weeklyProgress: false,
          newFeatures: false,
          friendActivity: false,
        },
        accessibility: {
          highContrast: false,
          largeText: false,
          reducem: false,
          screenReader: false,
        },
        preferences: {
          darkMode: false,
          soundEffects: true,
          voiceOver: false,
        },
      },
      language: "en-US",
      bio: "",
    };

    const newPrivateMetadata = {
      role: role ?? "free",
      subscription: subscription ?? "free",
      subscriptionStatus: "active",
      status: status || "active",
    };

    const shouldUpdate =
      !isEqual(clerk.publicMetadata, newPublicMetadata) ||
      !isEqual(clerk.privateMetadata, newPrivateMetadata);

    if (shouldUpdate) {
      clerkAwait.users.updateUser(id, {
        publicMetadata: newPublicMetadata,
        privateMetadata: newPrivateMetadata,
      });
    }

    // const user = await User.findByClerkId(id);

    // if (user) {
    //   user.xp = xp ?? user.xp;
    //   user.gems = gems ?? user.gems;
    //   user.gel = gel ?? user.gel;
    //   user.hearts = hearts ?? user.hearts;
    //   user.streak = streak ?? user.streak;
    //   await user.save();
    // } else {

    // }
    return true;
  } catch (error) {
    return error; // Return null if there's an error syncing the user
    // console.error("Error syncing user with Clerk:", error);
    // throw error;
  }
}

/**
 * Updates a user's role in Clerk and our database
 */
export async function updateUserRole(clerkId: string, role: UserRole) {
  try {
    // Connect to the database
    await connectDB();

    // Update the user's role in Clerk
    (await clerkClient()).users.updateUser(clerkId, {
      privateMetadata: { role },
    });

    return true;
  } catch (error) {
    console.error("Error updating user role:", error);
    throw error;
  }
}

/**
 * Updates a user's subscription in Clerk and our database
 */
export async function updateUserSubscription(
  clerkId: string,
  subscription: SubscriptionType
) {
  try {
    // Connect to the database
    await connectDB();

    // Update the user's subscription in Clerk
    await (
      await clerkClient()
    ).users.updateUser(clerkId, {
      privateMetadata: { subscription },
    });

    // Update the user's subscription in our database
    // const user = await UserModel.findByClerkId(clerkId);
    // if (user) {
    //   user.subscription = subscription;
    //   await user.save();

    return true;
  } catch (error) {
    console.error("Error updating user subscription:", error);
    throw error;
  }
}

/**
 * Records a login attempt for a user
 */
export async function recordLoginAttempt(
  clerkId: string,
  ip: string,
  device: string,
  browser: string,
  location: string,
  success: true
) {
  try {
    await connectDB();

    let user = await User.findByClerkId(clerkId);

    if (!user) {
      console.warn(
        `User with Clerk ID ${clerkId} not found. Creating new user.`
      );
      user = await User.create({ clerkId });
    }

    user.loginHistory?.push({
      date: new Date(),
      ip,
      device,
      browser,
      location,
      success,
    });

    await user.save();
    return user;
  } catch (error) {
    console.error("Error recording login attempt:", error);
    throw error;
  }
}

/**
 * Records a logout event for a user
 */
export async function recordLogoutAttempt(
  clerkId: string,
  sessionId: string,
  reason: string = "user_initiated" // optional reason, customize if needed
) {
  try {
    // Connect to the database
    await connectDB();

    // Get the user from your database
    const user = await User.findByClerkId(clerkId);

    if (!user) {
      throw new Error(`No user found with Clerk ID: ${clerkId}`);
    }

    // Add the logout record
    user.logoutHistory = user.logoutHistory || []; // ensure it exists
    user.logoutHistory.push({
      date: new Date(),
      sessionId,
      reason,
    });

    await user.save();
    return user;
  } catch (error) {
    console.error("Error recording logout attempt:", error);
    throw error;
  }
}

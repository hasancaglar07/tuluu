// app/actions/getSubscription.ts
import { Subscription } from "@/types";
import { auth, clerkClient } from "@clerk/nextjs/server";

const SUBSCRIPTION_CACHE_TTL_MS = 2 * 60 * 1000;

type SubscriptionCacheEntry = {
  expiresAt: number;
  value: Subscription;
};

const DEFAULT_SUBSCRIPTION: Subscription = {
  paidAt: 0,
  invoiceId: null as unknown as Subscription["invoiceId"],
  customerId: "",
  subscription: "free",
  subscriptionStatus: "inactive",
};

const globalForSubscriptionCache = globalThis as typeof globalThis & {
  _subscriptionCache?: Map<string, SubscriptionCacheEntry>;
};

const subscriptionCache = globalForSubscriptionCache._subscriptionCache ?? new Map();
globalForSubscriptionCache._subscriptionCache = subscriptionCache;

const toRecord = (value: unknown): Record<string, unknown> | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as Record<string, unknown>;
};

const normalizeSubscription = (value: unknown): Subscription["subscription"] => {
  return value === "premium" ? "premium" : "free";
};

const normalizeSubscriptionStatus = (
  value: unknown
): Subscription["subscriptionStatus"] => {
  return value === "active" ? "active" : "inactive";
};

const createSubscriptionPayload = (metadata: unknown): Subscription => {
  const data = toRecord(metadata) ?? {};
  return {
    ...DEFAULT_SUBSCRIPTION,
    paidAt: typeof data.paidAt === "number" ? data.paidAt : 0,
    customerId:
      typeof data.customerId === "string" ? data.customerId : "",
    invoiceId: (data.invoiceId ?? null) as Subscription["invoiceId"],
    subscription: normalizeSubscription(data.subscription),
    subscriptionStatus: normalizeSubscriptionStatus(data.subscriptionStatus),
  };
};

const getSubscriptionFromSessionClaims = (
  sessionClaims: unknown
): Subscription | null => {
  const claims = toRecord(sessionClaims);
  if (!claims) {
    return null;
  }

  const candidates = [
    claims.metadata,
    claims.private_metadata,
    claims.public_metadata,
    claims.unsafe_metadata,
  ];

  for (const candidate of candidates) {
    const record = toRecord(candidate);
    if (!record) {
      continue;
    }

    if ("subscription" in record || "subscriptionStatus" in record) {
      return createSubscriptionPayload(record);
    }
  }

  return null;
};

export async function getSubscription(): Promise<Subscription> {
  const { userId, sessionClaims } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const now = Date.now();
  const cached = subscriptionCache.get(userId);
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }

  const fromClaims = getSubscriptionFromSessionClaims(sessionClaims);
  if (fromClaims) {
    subscriptionCache.set(userId, {
      expiresAt: now + SUBSCRIPTION_CACHE_TTL_MS,
      value: fromClaims,
    });
    return fromClaims;
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  const subscription = createSubscriptionPayload(user.privateMetadata);

  subscriptionCache.set(userId, {
    expiresAt: now + SUBSCRIPTION_CACHE_TTL_MS,
    value: subscription,
  });

  return subscription;
}

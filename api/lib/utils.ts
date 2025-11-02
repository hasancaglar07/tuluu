import { auth, clerkClient } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export function generateRandomUsername() {
  const randomString = Math.random().toString(36).substring(2, 10); // Random alphanumeric string
  const timestamp = Date.now().toString(); // Unique timestamp to ensure uniqueness
  return `user_${randomString}_${timestamp}`;
}

export async function authGuard() {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const clerk = await clerkClient();
  const user = await clerk.users.getUser(userId);
  if (user.privateMetadata.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return { userId, user };
}

type StreakEntry = {
  date: Date | string;
  streakCount: number;
};

function getWeekRange(today = new Date()): Date[] {
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(today);
  weekStart.setHours(0, 0, 0, 0);
  weekStart.setDate(today.getDate() + mondayOffset);

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    weekDates.push(d);
  }
  return weekDates;
}

function formatDateISO(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export async function getWeekProgressFromStreakHistory(
  streakHistory: StreakEntry[]
): Promise<boolean[]> {
  const weekDates = getWeekRange();
  const streakMap = new Map<string, boolean>();

  streakHistory.forEach(({ date, streakCount }) => {
    const day = formatDateISO(new Date(date));
    if (streakCount > 0) {
      streakMap.set(day, true);
    }
  });

  return weekDates.map((d) => streakMap.get(formatDateISO(d)) || false);
}

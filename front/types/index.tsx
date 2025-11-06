import Stripe from "stripe";

// Define user subscription types
export type SubscriptionType = "free" | "premium";

// Define lesson status
export type LessonStatus = "locked" | "available" | "completed";

export type LanguageCategory =
  | "faith_morality"
  | "quran_arabic"
  | "math_logic"
  | "science_discovery"
  | "language_learning"
  | "mental_spiritual"
  | "personal_social"
  | "story_library";

export type ThemeAgeGroup = "kids_4-7" | "kids_8-12" | "teens_13-17" | "all";

export interface ThemeMetadata {
  islamicContent: boolean;
  ageGroup: ThemeAgeGroup;
  moralValues: string[];
  educationalFocus?: string | null;
  difficultyLevel: "beginner" | "intermediate" | "advanced";
}

export type MoralValue =
  | "patience"
  | "gratitude"
  | "kindness"
  | "honesty"
  | "sharing"
  | "mercy"
  | "justice"
  | "respect";

export type MoralDisplayTiming = "pre_lesson" | "mid_lesson" | "post_lesson";

export interface MoralLessonDetails {
  value: MoralValue;
  title?: string;
  storyText?: string;
  mediaUrl?: string;
  displayTiming?: MoralDisplayTiming;
}

export type MiniGameType = "match" | "quiz" | "puzzle" | "story" | "breathing";

export interface MiniGameDetails {
  type: MiniGameType;
  config?: Record<string, unknown>;
}

// Define chapter with units
export interface Chapter {
  _id: string;
  title: string;
  description: string;
  units: Unit[];
  isPremium: boolean;
  isCompleted: boolean;
  isExpanded?: boolean;
  order: number;
  contentType?: "lesson" | "story" | "game" | "meditation" | "quiz" | "activity";
  moralLesson?: MoralLessonDetails | null;
  miniGame?: MiniGameDetails | null;
  language?: {
    id: string;
    name: string;
    code: string;
    flag: string;
  };
}

// User state
export interface UserState {
  subscription: SubscriptionType;
  xp: number;
  hearts: number;
  gems: number; // Added gems property
  gel: number; // Added gel property
  email?: string; // Added gel property
  progress: {
    currentChapter: string;
    currentUnit: string;
    currentLesson: string;
  };
}

// Define the lesson exercise types
export type ExerciseType =
  | "translate"
  | "select"
  | "arrange"
  | "speak"
  | "listen";

// Define lesson content interface
export interface LessonContent {
  _id: string;
  title: string;
  chapterId: string;
  unitId: string;
  lessonId: string;
  xpReward: number;
  exercises: Exercise[];
  isPremium: boolean;
  isCompleted?: boolean;
  description: string;
  imageUrl: string;
  order: number;
  status: LessonStatus;
  moralLesson?: MoralLessonDetails | null;
  miniGame?: MiniGameDetails | null;
  storyPages?: StoryPage[];
  storyMetadata?: StoryMetadata | null;
}

export interface StoryPage {
  pageNumber: number;
  imageUrl: string;
  audioUrl?: string;
}

export interface StoryMetadata {
  bookId?: string;
  displayName?: string;
  coverImageUrl?: string;
  themeColor?: string;
  ageBadge?: string;
  hasAudio?: boolean;
  supportedLocales?: string[];
  primaryLocale?: string;
}

// SEO Types
export interface SEOEntry {
  _id: string;
  path: string;
  title: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
  locale: string;
  robots?: string;
  structuredData?: string;
  createdAt: Date;
  lastModified: Date;
}

export interface SEOFormData {
  path: string;
  title: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
  locale: string;
  robots: string;
  structuredData?: string;
}
// User Types
export interface User {
  id: string; // from MongoDB
  clerkId: string; // Clerk ID
  email: string;
  joinDate: number | string | Date; // depending on Clerk's `createdAt` format
  lastActive: number | string | Date;

  // Game data
  xp: number;
  gems: number;
  gel: number;
  hearts: number;
  streak: number;

  // Clerk metadata (you can make these more specific if you know the structure)
  publicMetadata: UserPublicMetadata;
  privateMetadata: UserPrivateMetadata;
  parentalControls?: {
    enabled: boolean;
    guardianContact?: string;
  };
  dailyLimits?: {
    minutesAllowed: number;
    minutesUsed: number;
    lastResetAt?: Date | string | null;
  };

  // Additional app data
  userCompletedLessons: number;
  userTotalLessons: number;
  userAchievements: unknown[]; // update type if you have a structure
  userRecentActivity: unknown[]; // update type if you have a structure
  userReports: unknown[]; // update type if you have a structure
  userLoginHistory: unknown[]; // update type if you have a structure
  createdAt: Date; // update type if you have a structure
  updatedAt: Date; // update type if you have a structure
  emailVerified: boolean; // update type if you have a structure
  lastSignInAt: Date; // update type if you have a structure
}
// Login Record Type
export interface LoginRecord {
  date: Date;
  ip: string;
  device: string;
  browser: string;
  location?: string;
  success: boolean;
}

export interface LogoutRecord {
  date: Date;
  sessionId: string;
  reason: string;
}
export type UserRole = "admin" | "free" | "paid";
type SubscriptionStatus = "active" | "inactive" | "cancelled" | "paused";

export type UserProfileSettings = {
  preferences: {
    darkMode: boolean;
    voiceOver: boolean;
    soundEffects: boolean;
  };
  accessibility: {
    reducem: boolean;
    largeText: boolean;
    highContrast: boolean;
    screenReader: boolean;
  };
  notifications: {
    newFeatures: boolean;
    dailyReminder: boolean;
    friendActivity: boolean;
    weeklyProgress: boolean;
  };
};

export type UserPublicMetadata = {
  bio: string;
  name: string;
  email: string;
  avatar: string;
  country: string;
  language: string;
  timezone: string;
  userName: string;
  settings: UserProfileSettings;
};

export type UserPrivateMetadata = {
  role: UserRole;
  status: "active" | "inactive";
  subscription: "free" | "premium";
  subscriptionStatus: SubscriptionStatus;
};

type ReportPriority = "low" | "medium" | "high" | "critical";
type ReportStatus = "open" | "in_progress" | "resolved" | "closed";
type ReportType = "bug" | "feedback" | "abuse" | "other"; // Add more as needed
type UserLoginRecord = {
  id: string;
  date: string | Date;
  success: boolean;
  ip: string;
  device: string;
  location?: string;
};
export type AppUser = {
  id: string; // from MongoDB
  clerkId: string; // Clerk ID
  name: string; // Clerk ID
  email: string;
  joinDate: number | string | Date; // depending on Clerk's `createdAt` format
  lastActive: number | string | Date;

  // Game data
  xp: number;
  gems: number;
  gel: number;
  hearts: number;
  streak: number;

  // Clerk metadata (you can make these more specific if you know the structure)
  publicMetadata: UserPublicMetadata;
  privateMetadata: UserPrivateMetadata;
  parentalControls?: {
    enabled: boolean;
    guardianContact?: string;
  };
  dailyLimits?: {
    minutesAllowed: number;
    minutesUsed: number;
    lastResetAt?: Date | string | null;
  };

  // Additional app data
  userCompletedLessons: number;
  userTotalLessons: number;
  userAchievements: {
    id: string;
    description: string;
    name: string;
    earnedDate: Date;
  }[]; // update type if you have a structure
  userRecentActivity: {
    id: string;
    type: string; // could be union: 'lesson' | 'quiz' | 'achievement' | etc.
    description: string;
    date: string | Date;
    xpEarned?: number;
    gemsEarned?: number;
  }[]; // update type if you have a structure
  userReports: {
    id: string;
    title: string;
    description: string;
    date: string | Date;
    priority: ReportPriority;
    status: ReportStatus;
    type: ReportType;
  }[]; // update type if you have a structure
  userLoginHistory: UserLoginRecord[]; // update type if you have a structure
  createdAt: Date; // update type if you have a structure
  updatedAt: Date; // update type if you have a structure
  emailVerified: boolean; // update type if you have a structure
  lastSignInAt: Date; // update type if you have a structure

  role: UserRole;
  status: SubscriptionStatus;
  subscription: SubscriptionType;
};

export type Achievement = {
  id: string;
  name: string;
  description: string;
  earnedDate: string;
  icon: string;
};

export type Activity = {
  id: string;
  type:
    | "lesson_completed"
    | "quest_completed"
    | "streak_milestone"
    | "purchase";
  description: string;
  date: string;
  xpEarned?: number;
  gemsEarned?: number;
};

export type Report = {
  id: string;
  type: "content_issue" | "bug" | string;
  status: "open" | "resolved" | string;
  title: string;
  description: string;
  date: string;
  priority: "low" | "medium" | "high" | string;
};

export type LoginEntry = {
  id: string;
  date: string;
  ip: string;
  device: string;
  browser: string;
  location: string;
  success: boolean;
};

export type UserEditProfile = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: SubscriptionStatus;
  subscription: SubscriptionType;
  xp: number;
  gems: number;
  gel: number;
  hearts: number;
  streak: number;
  joinDate: string;
  lastActive: string;
  avatar: string;
  bio: string;
  language: string;
  country: string;
  timezone: string;
  notifications: boolean;
  emailVerified: boolean;
  completedLessons: number;
  totalLessons: number;
  achievements: Achievement[];
  recentActivity: Activity[];
  reports: Report[];
  loginHistory: LoginEntry[];
};
export type ExerciseResponse = {
  _id: string;
  type: string; // e.g., 'translate', 'multiple-choice'
  instruction: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  correctAnswer: string[];
  options: string[];
  isNewWord: boolean;
  audioUrl: string;
  neutralAnswerImage: string;
  badAnswerImage: string;
  correctAnswerImage: string;
  isActive: boolean;
};

export type LessonResponseType = {
  id: string; // custom id format like "1-1-1"
  title: string;
  chapterId: string | number;
  unitId: string | number;
  languageId: string | number;
  lessonId: string;
  totalXp: number;
  isPremium: boolean;
  description: string;
  exercises: ExerciseResponse[];
};
export type Subscription = {
  paidAt: number;
  invoiceId: Stripe.Invoice;
  customerId: string;
  subscription: "premium" | "free";
  subscriptionStatus: "active" | "inactive";
};
export const exerciseTypes = [
  {
    value: "translate",
    labelKey: "admin.lessons.exerciseType.translate",
    defaultMessage: "Translate",
    supportsOptions: true,
  },
  {
    value: "select",
    labelKey: "admin.lessons.exerciseType.select",
    defaultMessage: "Select",
    supportsOptions: true,
  },
  {
    value: "arrange",
    labelKey: "admin.lessons.exerciseType.arrange",
    defaultMessage: "Arrange",
    supportsOptions: true,
  },
  {
    value: "speak",
    labelKey: "admin.lessons.exerciseType.speak",
    defaultMessage: "Speak",
    supportsAudio: true,
  },
  {
    value: "listen",
    labelKey: "admin.lessons.exerciseType.listen",
    defaultMessage: "Listen",
    supportsAudio: true,
  },
];

export interface TargetCriteria {
  minLevel?: number;
  maxLevel?: number;
  languages?: string[];
  countries?: string[];
  userTypes?: ("free" | "premium" | "trial")[];
  minStreak?: number;
  maxStreak?: number;
  registrationDateRange?: {
    from?: Date;
    to?: Date;
  };
}

// Quest related types

export interface QuestReward {
  type: "xp" | "gems" | "gel" | "hearts" | "badge" | "streak_freeze" | "custom";
  value: number | string;
  description?: string;
}

export interface QuestActivity {
  clerkId: string;
  status: string;
  progress: number;
  lastActivity: Date;
  completedAt?: Date;
}

export interface QuestSummary {
  totalActiveQuests: number;
  totalUpcomingQuests: number;
  averageCompletionRate: number;
  totalUsersEngaged: number;
  totalCompletedQuests: number;
}

export interface QuestApiResponse {
  success: boolean;
  data: Quest[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary: QuestSummary;
}

export interface CreateQuestPayload {
  title: string;
  description: string;
  type: Quest["type"];
  goal: string;
  conditions: QuestCondition[];
  rewards: QuestReward[];
  startDate: string | Date;
  endDate: string | Date;
  status?: Quest["status"];
  targetSegment: Quest["targetSegment"];
  targetCriteria?: TargetCriteria;
  difficulty?: Quest["difficulty"];
  category?: Quest["category"];
  priority?: number;
  maxParticipants?: number;
  isRepeatable?: boolean;
  cooldownPeriod?: number;
  isVisible?: boolean;
  isFeatured?: boolean;
  requiresApproval?: boolean;
  tags?: string[];
  notes?: string;
}

/**
 * Quest status types
 */
export type QuestStatus = "active" | "completed" | "locked";

/**
 * Quest difficulty levels
 */
export type QuestDifficulty = "easy" | "medium" | "hard";

/**
 * Quest duration/type categories
 */
export type QuestDuration = "daily" | "weekly" | "monthly" | "special";

/**
 * Quest condition type
 */
export interface QuestCondition {
  type:
    | "complete_lessons"
    | "earn_xp"
    | "maintain_streak"
    | "perfect_lessons"
    | "practice_minutes"
    | "complete_units"
    | "learn_words"
    | "use_hearts"
    | "custom";
  target: number;
  timeframe?: "daily" | "weekly" | "monthly" | "total" | "session";
  metadata?: Record<string, unknown>;
}

/**
 * Quest interface representing a quest in the frontend
 */

export interface Quest {
  id: string;
  title: string;
  description: string;
  type: "daily" | "weekly" | "monthly" | "event" | "achievement" | "custom";
  goal: string;
  conditions?: QuestCondition[];
  rewards?: QuestReward[];
  reward: QuestReward; // For backward compatibility with existing UI
  startDate: Date;
  endDate: Date;
  status:
    | "draft"
    | "active"
    | "paused"
    | "completed"
    | "expired"
    | "cancelled"
    | "locked";
  targetSegment: "all" | "premium" | "free";
  targetCriteria?: TargetCriteria;
  completionRate: number;
  usersAssigned: number;
  usersCompleted: number;
  usersStarted: number;
  usersAbandoned?: number;
  usersExpired?: number;
  averageProgress?: number;
  totalRewardsValue?: number;
  difficulty?: "easy" | "medium" | "hard" | "expert";
  category?: "learning" | "engagement" | "social" | "achievement" | "special";
  priority?: number;
  maxParticipants?: number;
  isRepeatable?: boolean;
  cooldownPeriod?: number;
  isVisible: boolean;
  isFeatured?: boolean;
  requiresApproval?: boolean;
  tags?: string[];
  notes?: string;
  createdBy?: string;
  lastModifiedBy?: string;
  createdAt: Date;
  updatedAt: Date;
  recentActivities?: QuestActivity[];
  sendNotifications?: boolean;
  duration: QuestDuration;
  progress: number;
  total: number;
  xpReward: number;
  badgeReward: string;
  heartsReward?: number;
  expiresIn?: string;
}

/**
 * User quest progress interface
 */
export interface QuestProgress {
  conditionId: string;
  conditionType: string;
  currentValue: number;
  targetValue: number;
  isCompleted: boolean;
  completedAt?: Date;
}

/**
 * Quest reward interface
 */
export interface QuestReward {
  rewardType: string;
  rewardValue: number | string;
  claimedAt: Date;
  transactionId?: string;
}

export type UpdateQuestPayload = Partial<CreateQuestPayload>;

export interface QuestStatusChangePayload {
  action: "pause" | "resume" | "activate" | "deactivate";
}

export type ShopItem = {
  id?: string;
  image?: string;
  name: string;
  description: string;
  type:
    | "power-up"
    | "cosmetic"
    | "consumable"
    | "currency"
    | "bundle"
    | "content";
  category: string;
  price: number;
  currency: "gems" | "coins" | "USD";
  stockType?: "unlimited" | "limited";
  stockQuantity?: number;
  stock?: string;
  eligibility?: string;
  isLimitedTime?: boolean;
  startDate?: Date | string;
  endDate?: Date | string;
  isActive?: boolean;
  status?: string;
  sendNotification?: boolean;
  notificationMessage?: string;
  purchases: number;
  revenue: number;
  views?: number;
  createdAt: Date;
};

export type AnalyticsData = {
  analytics: {
    totalRevenue: number;
    totalPurchases: number;
    averageOrderValue: number;
    conversionRate: string; // e.g. "12.5%"
    topSellingItem?: string | null; // assuming it’s a string or nullable
    topSellingCategory?: string | null;
    activeItems: number;
    inactiveItems: number;
  };
  topSellingItems: {
    name: string;
    purchases: number;
    revenue: number;
  }[];
  topCategories: {
    name: string;
    purchases: number;
    revenue: number;
    itemCount: number;
  }[];
  dailyTrends: {
    date: string; // assuming this is a string date like "2023-05-01"
    purchases: number;
    revenue: number;
  }[];
};
export type Category = {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  itemCount: number;
  sortOrder?: number;
  isActive: boolean;
};
export type SubscriptionPlan = {
  id: string;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  currency: string;
  billingCycle: string;
  trialPeriodDays?: number;
  features: string[];
  maxUsers?: number;
  maxProjects?: number;
  maxStorage?: number;
  maxApiCalls?: number;
  isPopular: boolean;
  promotionalPrice?: number;
  promotionalPeriod?: {
    startDate: string;
    endDate: string;
  };
  metadata: SubscriptionMetadata;
  formattedPrice: string;
  currentPrice: number;
  isOnPromotion: boolean;
  displayPrice: string;
};

export type SubscriptionMetadata = {
  color?: string;
  icon?: string;
  badge?: string;
  category?: string;
  targetAudience?: string;
};

// -----------------------------------
// Interfaces for Language, Chapter, Unit, Lesson, Exercise, Progress
// -----------------------------------
export type Language = {
  _id: string;
  name: string;
  imageUrl: string;
  baseLanguage: string;
  nativeName: string;
  flag: string;
  isCompleted: boolean;
  isActive: boolean;
  userCount: number;
  category: LanguageCategory;
  themeMetadata: ThemeMetadata;
  chapters: Chapter[];
};

export interface UserStats {
  xp: number;
  gems: number;
  gel: number;
  hearts: number;
  streak: number;
  lastActive: string | null;
}

export interface UserProgressType {
  userId: string;
  languageId: string;
  completedChapters?: { chapterId: string }[];
  completedUnits?: { unitId: string }[];
  completedLessons?: { lessonId: string }[];
  isCompleted?: boolean;
}

export interface Exercise {
  _id: string;
  type: string;
  instruction: string;
  sourceText: string;
  sourceLanguage: string;
  targetLanguage: string;
  correctAnswer: string;
  options: string[];
  isNewWord: boolean;
  audioUrl?: string;
  neutralAnswerImage?: string;
  badAnswerImage?: string;
  correctAnswerImage?: string;
  isActive: boolean;
  order: number;
  completed: boolean;
}

export interface Lesson {
  _id: string;
  title: string;
  chapterId: string;
  unitId: string;
  description: string;
  isPremium: boolean;
  isCompleted?: boolean;
  imageUrl: string;
  xpReward: number;
  order: number;
  exercises: Exercise[];
  status?: "completed" | "locked" | "available";
  moralLesson?: MoralLessonDetails | null;
  miniGame?: MiniGameDetails | null;
}

export interface Unit {
  _id: string;
  title: string;
  description: string;
  isPremium: boolean;
  isCompleted: boolean;
  color: string;
  isExpanded?: boolean;
  imageUrl: string;
  lessons: Lesson[];
  order: number;
}

// Menu item type definition for clarity and reusability
export interface MenuItem {
  label: string; // Text shown in menu
  icon: React.ComponentType<{ size?: number; className?: string }>; // Icon component
  href: string; // Link target
  bgColor: string; // Icon background color
  textColor: string; // Text color
  isActive?: boolean; // Is this menu item active (highlighted)?
}
// Type definitions for our subscription payment flow
// These interfaces define the shape of our data objects

// export interface SubscriptionPlan {
//   id: string;
//   name: string;
//   description: string;
//   shortDescription: string;
//   price: number;
//   billingCycle: string;
//   trialPeriodDays: number;
//   features: string[];
//   isOnPromotion: boolean;
//   promotionalPrice?: number;
//   promotionEndDate?: string;
// }

export interface PaymentProvider {
  id: string;
  name: string;
  description: string;
  icon: string;
  type: string;
  config: unknown;
}

// Union type for the different steps in our payment flow
export type PaymentStep = "method" | "details" | "review" | "success";

// Interface for credit card form data
export interface CardDetails {
  cardNumber: string;
  cardEmail?: string;
  cardName: string;
  expiry: string;
  cvc: string;
}

export interface UserStatsResponse {
  count: number;
  percentageChange: number;
  trend: "up" | "down" | "neutral";
}

export interface LessonStats {
  count: number;
  percentageChange: number;
  trend: "up" | "down" | "neutral";
}

export interface QuestStats {
  count: number;
  newThisMonth: number;
}

export interface RevenueStats {
  amount: number;
  percentageChange: number;
  trend: "up" | "down" | "neutral";
  simulated?: boolean;
}

export interface ActivityDataPoint {
  date: string;
  activeUsers: number;
}

export interface DashboardData {
  usersData: UserStatsResponse;
  lessonsData: LessonStats;
  questsData: QuestStats;
  revenueData: RevenueStats;
  activityData: ActivityDataPoint[];
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

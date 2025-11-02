import { Types } from "mongoose";

export interface NotificationSettings {
  dailyReminder: boolean; // Rappel quotidien
  weeklyProgress: boolean; // Progrès hebdomadaire
  featureUpdates: boolean; // Nouvelles fonctionnalités
  friendActivity: boolean; // Activité des amis
}

export interface AccessibilitySettings {
  highContrast: boolean; // Contraste élevé
  largeText: boolean; // Texte plus grand
  reduceAnimations: boolean; // Réduire les animations
  screenReader: boolean; // Compatibilité lecteur d'écran
}

export interface PreferenceSettings {
  darkMode: boolean; // Mode sombre
  soundEffects: boolean; // Effets sonores
  voiceOver: boolean; // Voix off
}

// User Types
export interface User {
  id: string;
  clerkId: string;
  xp: number;
  gems: number;
  gel: number;
  hearts: number;
  streak: number;
  achievements?: string[]; // Array of achievement IDs
  loginHistory?: LoginRecord[];
  logoutHistory?: LogoutRecord[];
}

export type UserRole = "admin" | "free" | "paid";
export type UserStatus = "active" | "inactive" | "banned" | "suspended";
export type SubscriptionType = "free" | "premium";

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

// Achievement Type
export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  criteria: {
    type: AchievementCriteriaType;
    value: number;
  };
}

export type AchievementCriteriaType =
  | "lessons_completed"
  | "streak_days"
  | "xp_earned"
  | "perfect_lessons"
  | "quests_completed";

// User Achievement Type
export interface UserAchievement {
  userId: string;
  achievementId: string;
  earnedDate: Date;
}

// Lesson Type
export interface Lesson {
  id: string;
  title: string;
  description: string;
  unitId: string;
  order: number;
  xpReward: number;
  gemReward: number;
  content: LessonContent[];
  difficulty: "beginner" | "intermediate" | "advanced";
}

export type LessonContent = {
  type: "text" | "quiz" | "matching" | "listening" | "speaking";
  // data: any; // This would be more specific based on the content type
};

// Unit Type
export interface Unit {
  id: string;
  title: string;
  description: string;
  chapterId: string;
  order: number;
  lessons: Lesson[];
}

// Chapter Type
export interface Chapter {
  id: string;
  title: string;
  description: string;
  languageId: string;
  order: number;
  units: Unit[];
}

// Language Type
export interface Language {
  id: string;
  name: string;
  code: string;
  flag: string;
  isActive: boolean;
}

// User Progress Type
export interface UserProgress {
  userId: string;
  completedLessons: {
    lessonId: string;
    completedAt: Date;
    score: number;
    xpEarned: number;
    gemsEarned: number;
  }[];
  currentLesson?: {
    lessonId: string;
    progress: number; // 0-100
    lastAccessed: Date;
  };
}

// Report Type
export interface Report {
  id: string;
  userId: string;
  type: ReportType;
  status: ReportStatus;
  title: string;
  description: string;
  date: Date;
  priority: ReportPriority;
}

export type ReportType =
  | "bug"
  | "content_issue"
  | "user_report"
  | "payment_issue";
export type ReportStatus = "open" | "in_progress" | "resolved" | "closed";
export type ReportPriority = "low" | "medium" | "high" | "critical";

// Activity Type
export interface Activity {
  id: string;
  userId: string;
  type: ActivityType;
  description: string;
  date: Date;
  xpEarned?: number;
  gemsEarned?: number;
  metadata?: Record<string, unknown>;
}

export type ActivityType =
  | "lesson_completed"
  | "quest_completed"
  | "streak_milestone"
  | "level_up"
  | "purchase"
  | "achievement_earned";

// Quest Type
export interface Quest {
  id: string;
  title: string;
  description: string;
  type: QuestType;
  requirement: number;
  xpReward: number;
  gemReward: number;
  duration: number; // in days
  isActive: boolean;
}

export type QuestType = "daily" | "weekly" | "monthly" | "special";

// User Quest Type
export interface UserQuest {
  userId: string;
  questId: string;
  progress: number;
  isCompleted: boolean;
  startDate: Date;
  completedDate?: Date;
}

// Shop Item Type
export interface ShopItem {
  id: string;
  name: string;
  description: string;
  type: ShopItemType;
  price: number;
  currency: "gems" | "real";
  image: string;
  isActive: boolean;
}

export type ShopItemType =
  | "streak_freeze"
  | "heart_refill"
  | "character_customization"
  | "theme"
  | "power_up";

// User Purchase Type
export interface UserPurchase {
  userId: string;
  itemId: string;
  purchaseDate: Date;
  quantity: number;
  totalPrice: number;
  currency: "gems" | "real";
  transactionId?: string;
}

export interface MyPublicMetadata {
  role?: UserRole;
}

type EmailAddress = {
  id: string;
  email_address: string;
  verification: {
    status: "verified" | "unverified" | "pending";
    strategy: string;
  };
};

type Subscription = {
  status: "active" | "inactive" | "cancelled";
  plan: string;
  renewalDate?: string;
};

export type UserProfileData = {
  id: string;
  primary_email_address_id?: string;
  email_addresses: EmailAddress[];
  first_name: string;
  last_name: string;
  image_url: string;
  xp?: number;
  gems?: number;
  gel?: number;
  hearts?: number;
  streak?: number;
  subscription?: Subscription;
  role?: UserRole;
  status?: UserStatus;
};

export interface ClerkUser {
  id: string;
  email_addresses: { id: string; email_address: string }[];
  first_name: string;
  last_name: string;
  image_url: string;
  xp?: number;
  gems?: number;
  gel?: number;
  hearts?: number;
  streak?: number;
  subscription?: string;
  role?: string;
  status?: string;
  primary_email_address_id: string;
}

// Language Learning Types
export interface Language {
  id: string;
  name: string;
  nativeName: string;
  flag: string;
  baseLanguage: string;
  isActive: boolean;
}

export interface Chapter {
  id: string;
  languageId: string;
  title: string;
  description: string;
  isPremium: boolean;
  isExpanded: boolean;
  imageUrl: string;
  order: number;
}

export interface Unit {
  id: string;
  chapterId: string;
  languageId: string;
  title: string;
  description: string;
  isPremium: boolean;
  isExpanded: boolean;
  imageUrl: string;
  order: number;
}

export interface Lesson {
  id: string;
  unitId: string;
  chapterId: number;
  languageId: string;
  title: string;
  description: string;
  isPremium: boolean;
  status: "available" | "locked" | "completed";
  xpReward: number;
  imageUrl: string;
  order: number;
}

export interface Exercise {
  id: string;
  lessonId: string;
  unitId: string;
  chapterId: string;
  languageId: string;
  type: "translate" | "select" | "arrange" | "match" | "listen" | "speak";
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
  order: number;
}
export type ExerciseResponse = {
  _id: Types.ObjectId;
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
  order: number;
};

export type LessonResponseType = {
  id: string; // custom id format like "1-1-1"
  title: string;
  chapterId: string | number;
  unitId: string | number;
  lessonId: string;
  totalXp: number;
  isPremium: boolean;
  description: string;
  exercises: ExerciseResponse[];
};

type PublicMetadataSettings = {
  notifications: {
    dailyReminder: boolean;
    weeklyProgress: boolean;
    newFeatures: boolean;
    friendActivity: boolean;
  };
  accessibility: {
    highContrast: boolean;
    largeText: boolean;
    reducem: boolean;
    screenReader: boolean;
  };
  preferences: {
    darkMode: boolean;
    soundEffects: boolean;
    voiceOver: boolean;
  };
};

export type Etype = {
  name: string;
  email: string;
  userName: string;
  avatar: string;
  country: string;
  timezone: string;
  settings: PublicMetadataSettings;
  language: string;
  bio: string;
};

// **Payment Provider Configuration Interface**
export type PaymentProvider = {
  enabled: boolean;
  publicKey?: string;
  secretKey?: string;
  webhookSecret?: string;
  clientId?: string;
  clientSecret?: string;
  merchantId?: string;
  environment: "sandbox" | "production";
  metadata?: Record<string, unknown>;
};

// **In-App Currency Configuration Interface**
export type InAppCurrency = {
  enabled: boolean;
  exchangeRate: number;
  dailyBonus?: number;
  gemsCost?: number;
  refillTimeHours?: number;
  maxAmount?: number;
  minPurchase?: number;
  metadata?: Record<string, unknown>;
};

// **Regional Settings Interface**
export type RegionalSetting = {
  name: string;
  currency: string;
  priceMultiplier: number;
  taxRate: number;
  status: "active" | "pending" | "inactive";
  countryCode: string;
  timezone: string;
  paymentMethods?: string[];
  metadata?: Record<string, unknown>;
};

// **General Settings Interface**
export type GeneralSettings = {
  enablePayments: boolean;
  testMode: boolean;
  autoRetryFailedPayments: boolean;
  sendPaymentReceipts: boolean;
  companyName: string;
  companyAddress: string;
  billingEmail: string;
  billingPhone: string;
  companyLogo?: string;
  companyWebsite?: string;
  supportEmail?: string;
  termsOfServiceUrl?: string;
  privacyPolicyUrl?: string;
  refundPolicy?: string;
  metadata?: Record<string, unknown>;
};

// **Currency Settings Interface**
export type CurrencySettings = {
  defaultCurrency: string;
  autoUpdateExchangeRates: boolean;
  exchangeRateProvider:
    | "fixer"
    | "openexchangerates"
    | "currencylayer"
    | "manual";
  exchangeRateApiKey?: string;
  supportedCurrencies: string[];
  gems: InAppCurrency;
  hearts: InAppCurrency;
  metadata?: Record<string, unknown>;
};

// **Regional Settings Interface**
export type RegionalSettings = {
  regionalPricing: boolean;
  taxCalculation: boolean;
  autoDetectRegion: boolean;
  defaultRegion: string;
  regions: RegionalSetting[];
  metadata?: Record<string, unknown>;
};

export type PromotionalPeriod = {
  startDate?: Date | null;
  endDate?: Date | null;
};

export type SubscriptionPlanDoc = {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  description: string;
  shortDescription?: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "quarterly" | "yearly" | "lifetime";
  trialPeriodDays: number;
  features: string[];
  maxUsers?: number;
  maxProjects?: number;
  maxStorage?: number;
  maxApiCalls?: number;
  status: "active" | "inactive" | "archived";
  isPopular: boolean;
  isVisible: boolean;
  sortOrder: number;
  promotionalPrice?: number;
  promotionalPeriod?: PromotionalPeriod;
  stripeProductId?: string;
  checkoutLink: string;
  stripePriceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
};

export type TransformedPlan = {
  id: string;
  name: string;
  slug?: string;
  description: string;
  shortDescription?: string;
  price: number;
  currency: string;
  billingCycle: "monthly" | "quarterly" | "yearly" | "lifetime";
  trialPeriodDays: number;
  features: string[];
  maxUsers?: number;
  maxProjects?: number;
  maxStorage?: number;
  maxApiCalls?: number;
  status: "active" | "inactive" | "archived";
  isPopular: boolean;
  isVisible: boolean;
  sortOrder: number;
  promotionalPrice?: number;
  promotionalPeriod?: PromotionalPeriod;
  stripeProductId?: string;
  stripePriceId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  updatedAt: Date;
  formattedPrice: string;
  currentPrice: number;
  isOnPromotion?: boolean;
};
export type PlanStat = {
  _id: "active" | "inactive" | "archived";
  count: number;
};
export interface QuestCondition {
  type?:
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
  currentValue?: number;
  conditionId: string;
  conditionType:
    | "complete_lessons"
    | "earn_xp"
    | "maintain_streak"
    | "perfect_lessons"
    | "practice_minutes"
    | "complete_units"
    | "learn_words"
    | "use_hearts"
    | "custom";
}

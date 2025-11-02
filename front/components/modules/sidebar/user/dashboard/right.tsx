"use client";

// External components and utilities
import { LocaleLink } from "@/components/custom/locale-link";
import { SaveProgressAlert } from "@/components/modules/lesson/save-progressalert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { IRootState } from "@/store";
import { Language, Quest, Subscription } from "@/types";
import { m } from "framer-motion";
import { Heart, Star } from "lucide-react";
import Image from "next/image";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { FormattedMessage } from "react-intl";
import { useAuth } from "@clerk/nextjs";
import { apiClient } from "@/lib/api-client";

/**
 * Main Right Sidebar Component for Dashboard
 * Displays user stats, subscription info, progress, and daily quests.
 */
export default function RightSidebarDashboard({
  subscription,
}: {
  subscription: Subscription;
}) {
  // Pull user and app data from Redux store
  const userData = useSelector((state: IRootState) => state.user);
  const progress = useSelector((state: IRootState) => state.progress);
  const chapters = useSelector((state: IRootState) => state.lessons.chapters);
  const language = useSelector((state: IRootState) => state.lessons.language);

  const hasPremium = subscription.subscription === "premium";
  const router = useLocalizedRouter();

  // Handle upgrade button click
  const upgradeSubscription = () => {
    router.push("/subscriptions");
  };

  // Calculate total and completed lessons
  const totalLessons = chapters.reduce(
    (total, chapter) =>
      total +
      chapter.units.reduce(
        (unitTotal, unit) => unitTotal + unit.lessons.length,
        0
      ),
    0
  );

  const completedLessons = progress.completedLessons.length;

  return (
    <div className="hidden md:block w-[400px] border-l border-gray-200 p-4">
      {/* Top user stats section (hearts, gems, gel, flag) */}
      <HeaderStats userData={userData} language={language} />

      {/* Alert to encourage saving progress if user is not premium */}
      {!hasPremium && <SaveProgressAlert />}

      {/* Premium/Free subscription details with upgrade button */}
      <SubscriptionCard
        hasPremium={hasPremium}
        upgradeSubscription={upgradeSubscription}
      />

      {/* User lesson and XP progress tracking */}
      <ProgressCard
        completedLessons={completedLessons}
        totalLessons={totalLessons}
        userXp={userData.xp}
      />

      {/* Daily quest progress preview */}
      <DailyQuestsCard userXp={userData.xp} />
    </div>
  );
}

// ------------------------------------------------------
// Header section showing user stats (hearts, gems, gel)
// ------------------------------------------------------
function HeaderStats({
  userData,
  language,
}: {
  userData: {
    gel: number;
    gems: number;
    hearts: number;
  };
  language: Language;
}) {
  return (
    <div className="flex justify-between items-center mb-6">
      {/* User-selected language flag */}
      <div className="flex items-center gap-2">
        <Image
          src={`${
            language.imageUrl ??
            "https://cdn-icons-png.flaticon.com/128/206/206657.png"
          }`}
          alt=""
          width="0"
          height="0"
          className="w-full h-8 rounded-full"
          sizes="100vw"
        />
      </div>

      {/* Stats: GEL 🔥, Gems 💎, Hearts ❤️ */}
      <div className="flex items-center gap-14">
        <m.div
          className="flex items-center gap-1 text-amber-500 font-bold"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          🔥<span>{userData.gel}</span>
        </m.div>
        <m.div
          className="flex items-center gap-1 text-blue-500 font-bold"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Image
            src="https://img.icons8.com/arcade/64/emerald.png"
            alt="gems"
            width="20"
            height="20"
          />
          <span>{userData.gems}</span>
        </m.div>
        <m.div
          className="flex items-center gap-1 text-[#ff4b4b] font-bold"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <Heart fill="#ff4b4b" size={20} />
          <span>{userData.hearts}</span>
        </m.div>
      </div>
    </div>
  );
}

// ------------------------------------------------------
// Subscription status card (Free vs Premium)
// ------------------------------------------------------
function SubscriptionCard({
  hasPremium,
  upgradeSubscription,
}: {
  hasPremium: boolean;
  upgradeSubscription: () => void;
}) {
  return (
    <m.div
      className="border border-gray-200 rounded-xl p-4 mb-4 bg-gradient-to-r from-[#ffc800]/10 to-[#ffc800]/5"
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <h3 className="font-bold text-lg mb-2">
        <FormattedMessage
          id="sidebar.subscription.title"
          defaultMessage="Your Subscription"
        />
      </h3>
      <div className="flex items-center gap-2 mb-4">
        <Badge
          variant={hasPremium ? "default" : "outline"}
          className={hasPremium ? "bg-[#ffc800] text-black" : ""}
        >
          <FormattedMessage
            id={
              hasPremium
                ? "sidebar.subscription.premium"
                : "sidebar.subscription.free"
            }
            defaultMessage={hasPremium ? "PREMIUM" : "FREE"}
          />
        </Badge>
      </div>

      {/* Conditional: Show upgrade CTA if user is not premium */}
      {!hasPremium ? (
        <>
          <p className="text-sm text-gray-600 mb-4">
            <FormattedMessage
              id="sidebar.subscription.upgradeMessage"
              defaultMessage="Upgrade to Premium to access all content and learn without limits!"
            />
          </p>
          <m.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Button
              size="lg"
              onClick={upgradeSubscription}
              className="w-full bg-yellow-500 hover:bg-yellow-600 text-black"
            >
              <FormattedMessage
                id="sidebar.subscription.upgradeButton"
                defaultMessage="UPGRADE TO PREMIUM"
              />
            </Button>
          </m.div>
        </>
      ) : (
        <p className="text-sm text-gray-600">
          <FormattedMessage
            id="sidebar.subscription.premiumMessage"
            defaultMessage="You have access to all premium content. Enjoy your learning!"
          />
        </p>
      )}
    </m.div>
  );
}

// ------------------------------------------------------
// User learning progress (lessons & XP)
// ------------------------------------------------------
function ProgressCard({
  completedLessons,
  totalLessons,
  userXp,
}: {
  completedLessons: number;
  totalLessons: number;
  userXp: number;
}) {
  return (
    <m.div
      className="border border-gray-200 rounded-xl p-4 mb-4"
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <h3 className="font-bold text-lg mb-4">
        <FormattedMessage
          id="sidebar.progress.title"
          defaultMessage="Your Progress"
        />
      </h3>
      <div className="space-y-4">
        {/* Lessons completed progress */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>
              <FormattedMessage
                id="sidebar.progress.completed"
                defaultMessage="Lessons Completed"
              />
            </span>
            <span className="font-bold">
              {completedLessons}/{totalLessons}
            </span>
          </div>
          <m.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Progress
              value={(completedLessons / totalLessons) * 100}
              className="h-2"
            />
          </m.div>
        </div>

        {/* XP gained this week */}
        <div>
          <div className="flex justify-between text-sm mb-1">
            <span>
              <FormattedMessage
                id="sidebar.progress.xpWeek"
                defaultMessage="XP This Week"
              />
            </span>
            <span className="font-bold">{userXp}/5000</span>
          </div>
          <m.div
            initial={{ width: 0 }}
            animate={{ width: "100%" }}
            transition={{ duration: 1, ease: "easeOut" }}
          >
            <Progress value={(userXp / 5000) * 100} className="h-2" />
          </m.div>
        </div>
      </div>
    </m.div>
  );
}

// ------------------------------------------------------
// Daily Quests Preview
// ------------------------------------------------------
function DailyQuestsCard({ userXp }: { userXp: number }) {
  const [dailyQuests, setDailyQuests] = useState<Quest[]>([]); // initially null
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken, userId } = useAuth();

  // Fetch daily quests
  useEffect(() => {
    const fetchDailyQuests = async () => {
      if (!userId) return;

      try {
        setIsLoading(true);
        const token = await getToken();
        const response = await apiClient.get(
          `/api/users/${userId}/quests?type=daily`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (response.data.success) {
          setDailyQuests(response.data.data.quests);
        } else {
          setError("Failed to load quests, relaod the page");
        }
      } catch (err) {
        console.error("Error fetching daily quests:", err);
        setError("Error loading quests, reload the page");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDailyQuests();
  }, [userId, getToken]);

  return (
    <m.div
      className="border border-gray-200 rounded-xl p-4 mb-4"
      whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">
          <FormattedMessage
            id="sidebar.quests.title"
            defaultMessage="Daily Quests"
          />
        </h3>
        <LocaleLink
          href="/quests"
          className="text-primary-500 text-sm font-bold"
        >
          <FormattedMessage
            id="sidebar.quests.viewAll"
            defaultMessage="VIEW ALL"
          />
        </LocaleLink>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-500"></div>
        </div>
      ) : error ? (
        <div className="text-sm text-gray-500 text-center py-2">{error}</div>
      ) : dailyQuests && dailyQuests.length > 0 ? (
        dailyQuests.slice(0, 2).map((quest) => (
          <div key={quest.id} className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <div className="font-bold text-sm">{quest.title}</div>
              <m.div
                initial={{ width: 0 }}
                animate={{ width: "100%" }}
                transition={{ duration: 1, ease: "easeOut" }}
              >
                <Progress
                  value={(quest.progress / quest.total) * 100}
                  className="h-2 mt-1"
                />
              </m.div>
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>
                  {quest.progress} / {quest.total}
                </span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-yellow-500" />
                  {quest.xpReward} XP
                </span>
              </div>
            </div>
          </div>
        ))
      ) : (
        // Show this only if we've loaded and there are no quests
        // <div className="text-sm text-gray-500 text-center py-2">
        //   <FormattedMessage
        //     id="sidebar.quests.none"
        //     defaultMessage="No daily quests available"
        //   />
        // </div>
        <></>
      )}

      {/* Fallback to XP progress if no quests are available */}
      {!isLoading && !error && dailyQuests.length === 0 && (
        <div className="flex items-center gap-3 mb-2">
          <div className="flex-1">
            <div className="font-bold">
              <FormattedMessage
                id="sidebar.quests.earnXp"
                defaultMessage="Earn 10 XP"
              />
            </div>
            <m.div
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 1, ease: "easeOut" }}
            >
              <Progress value={(userXp % 10) * 10} className="h-2 mt-1" />
            </m.div>
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{userXp % 10} / 10</span>
            </div>
          </div>
        </div>
      )}
    </m.div>
  );
}

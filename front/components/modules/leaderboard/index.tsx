// LeaderboardPage.tsx
"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@clerk/nextjs";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { ArrowLeft, Loader2, Medal, Search, Trophy } from "lucide-react";
import Image from "next/image";
import { m } from "framer-motion";
import { FormattedMessage } from "react-intl";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/api-client";

interface LeaderboardUser {
  id: string;
  username: string;
  name: string;
  email: string;
  avatar: string;
  country: string;
  countryFlag: string;
  xp: number;
  gems: number;
  gel: number;
  streak?: number;
  longestStreak?: number;
  rank: number;
  lastActivity: string | null;
  createdAt: number;
  isCurrentUser?: boolean;
}

interface LeaderboardResponse {
  success: boolean;
  data: LeaderboardUser[];
  total: number;
  timeFilter: string;
  search: string;
}

export default function LeaderboardPage() {
  const router = useLocalizedRouter();
  const { userId, getToken } = useAuth();

  const [leaderboardUsers, setLeaderboardUsers] = useState<LeaderboardUser[]>(
    []
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [timeFilter, setTimeFilter] = useState("allTime");

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {
        timeFilter,
        limit: "50",
        ...(searchQuery.trim() && { search: searchQuery.trim() }),
      };
      const token = await getToken();

      const response = await apiClient.get("/api/leaderboards", {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        params,
      });

      const data: LeaderboardResponse = response.data;

      if (!data.success) throw new Error("Failed to fetch leaderboard");

      const usersWithCurrentUser = data.data.map((user) => ({
        ...user,
        isCurrentUser: user.id === userId,
      }));

      setLeaderboardUsers(usersWithCurrentUser);
    } catch (err) {
      console.error("Error fetching leaderboard:", err);
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.error ||
            err.message ||
            "Failed to load leaderboard"
        );
      } else {
        setError(
          err instanceof Error ? err.message : "Failed to load leaderboard"
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [timeFilter]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchLeaderboard();
    }, 500);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <LeaderboardHeader onBack={() => router.push("/dashboard")} />

      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        <LeaderboardFilters
          loading={loading}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          timeFilter={timeFilter}
          setTimeFilter={setTimeFilter}
        />

        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
            <span className="ml-2 text-gray-600">
              <FormattedMessage
                id="leaderboard.loading"
                defaultMessage="Chargement du classement..."
              />
            </span>
          </div>
        )}

        {error && !loading && (
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">❌ {error}</div>
            <Button onClick={fetchLeaderboard} variant="outline">
              <FormattedMessage
                id="leaderboard.retry"
                defaultMessage="Réessayer"
              />
            </Button>
          </div>
        )}

        {!loading && !error && <LeaderboardList users={leaderboardUsers} />}
      </div>

      <div className="p-4 border-t border-gray-200 text-center text-sm text-gray-500">
        <FormattedMessage
          id="leaderboard.realtime"
          defaultMessage="Le classement est mis à jour en temps réel"
        />
      </div>
    </div>
  );
}

const LeaderboardHeader = ({ onBack }: { onBack: () => void }) => (
  <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-primary-500 text-white">
    <div className="flex items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="text-white hover:bg-white/20"
      >
        <ArrowLeft className="h-6 w-6" />
      </Button>
      <h1 className="text-xl font-bold">
        <FormattedMessage id="leaderboard.title" defaultMessage="Classement" />
      </h1>
    </div>
  </div>
);

const LeaderboardFilters = ({
  loading,
  searchQuery,
  setSearchQuery,
  timeFilter,
  setTimeFilter,
}: {
  loading: boolean;
  searchQuery: string;
  setSearchQuery: (val: string) => void;
  timeFilter: string;
  setTimeFilter: (val: string) => void;
}) => (
  <div className="mb-6 flex flex-col sm:flex-row gap-4">
    <div className="relative flex-1">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      <Input
        placeholder="Rechercher un utilisateur..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="pl-10"
        disabled={loading}
      />
    </div>
    <Select value={timeFilter} onValueChange={setTimeFilter} disabled={loading}>
      <SelectTrigger className="w-full sm:w-[180px]">
        <SelectValue placeholder="Période" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="week">Cette semaine</SelectItem>
        <SelectItem value="month">Ce mois</SelectItem>
        <SelectItem value="allTime">Tout le temps</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

const LeaderboardList = ({ users }: { users: LeaderboardUser[] }) => {
  const getBadge = (rank: number) => {
    if (rank === 1)
      return (
        <div className="absolute -top-1 -right-1">
          <Trophy className="h-6 w-6 text-yellow-500 drop-shadow-md" />
        </div>
      );
    if (rank === 2)
      return (
        <div className="absolute -top-1 -right-1">
          <Medal className="h-5 w-5 text-gray-300 drop-shadow-md" />
        </div>
      );
    if (rank === 3)
      return (
        <div className="absolute -top-1 -right-1">
          <Medal className="h-5 w-5 text-amber-700 drop-shadow-md" />
        </div>
      );
    return null;
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <FormattedMessage
          id="leaderboard.noUsers"
          defaultMessage="Aucun utilisateur trouvé"
        />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-4 py-2 font-bold text-gray-500 text-sm">
        <div className="w-12 text-center">
          <FormattedMessage id="leaderboard.rank" defaultMessage="RANG" />
        </div>
        <div className="flex-1">
          <FormattedMessage
            id="leaderboard.user"
            defaultMessage="UTILISATEUR"
          />
        </div>
        <div className="w-20 text-center">
          <FormattedMessage id="leaderboard.xp" defaultMessage="XP" />
        </div>
        <div className="w-20 text-center hidden sm:block">
          <FormattedMessage id="leaderboard.streak" defaultMessage="SÉRIE" />
        </div>
      </div>

      {users.map((user, index) => (
        <m.div
          key={user.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className={`flex items-center p-4 rounded-xl ${
            user.isCurrentUser
              ? "bg-blue-50 border border-blue-200"
              : "bg-white border border-gray-100 hover:border-gray-200"
          } transition-all`}
          whileHover={{ scale: 1.01 }}
        >
          <div className="w-12 text-center font-bold text-gray-500">
            #{user.rank}
          </div>
          <div className="flex-1 flex items-center gap-3">
            <div className="relative">
              <Image
                src={user.avatar || "/placeholder.svg"}
                width={40}
                height={40}
                alt={user.username}
                className="rounded-full"
              />
              {user.rank <= 3 && getBadge(user.rank)}
            </div>
            <div>
              <div className="font-bold flex items-center gap-1">
                {user.username}
                {user.isCurrentUser && (
                  <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full">
                    <FormattedMessage
                      id="leaderboard.you"
                      defaultMessage="Vous"
                    />
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-500 flex items-center gap-1">
                <span>{user.countryFlag}</span>
                <span>{user.country}</span>
                {user.name && user.name !== "null" && (
                  <span className="ml-1">• {user.name}</span>
                )}
              </div>
            </div>
          </div>
          <div className="w-20 text-center font-bold">
            {user.xp.toLocaleString()}
          </div>
          <div className="w-20 text-center hidden sm:block">
            <div className="flex items-center justify-center gap-1">
              <span className="text-orange-500">🔥</span>
              <span className="font-bold">{user.streak || 0}</span>
            </div>
          </div>
        </m.div>
      ))}
    </div>
  );
};

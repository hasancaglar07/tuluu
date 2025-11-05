"use client";

import { useState } from "react";
import Image from "next/image";
import { m } from "framer-motion";
import {
  ArrowLeft,
  User,
  Settings,
  Bell,
  Globe,
  LogOut,
  Trash2,
  ChevronRight,
  Heart,
  Loader2,
} from "lucide-react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { FormattedMessage, useIntl } from "react-intl";

import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { IRootState } from "@/store";
import { useSelector } from "react-redux";
import { useClerk, useUser } from "@clerk/nextjs";
import { toast } from "sonner";

type Settings = {
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

export default function Profile() {
  const router = useLocalizedRouter();
  const userData = useSelector((state: IRootState) => state.user);
  const intl = useIntl();

  const { user } = useUser();
  const primaryEmail = user?.primaryEmailAddressId
    ? user.emailAddresses.find(
        (email) => email.id === user.primaryEmailAddressId
      )?.emailAddress
    : null;
  // State for dialogs
  const [isLoading, setIsLoading] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  // State for settings

  const [settings, setSettings] = useState<Settings>({
    notifications: {
      dailyReminder: true,
      weeklyProgress: true,
      newFeatures: false,
      friendActivity: true,
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
      voiceOver: true,
    },
  });

  const { signOut } = useClerk();
  // Handle logout
  const handleLogout = async () => {
    setIsLoading(true);
    await signOut();
    toast.success(
      intl.formatMessage({
        id: "toast.logout.success",
        defaultMessage: "You logged out",
      }),
      {
        description: intl.formatMessage({
          id: "toast.logout.description",
          defaultMessage: "Catch you later, alligator! 🐶​",
        }),
        className: "bg-warning-500",
        closeButton: true,
        position: "top-center",
        duration: 10000,
      }
    );

    setShowLogoutDialog(false);
    setIsLoading(false);
    router.push("/");
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    if (deleteConfirmation === "DELETE") {
      toast.warning(
        intl.formatMessage({
          id: "toast.delete.warning",
          defaultMessage: "Account deleted",
        }),
        {
          description: intl.formatMessage({
            id: "toast.delete.description",
            defaultMessage: "Your journey ends here... but we'll miss you! 💔",
          }),
        }
      );
      setShowDeleteDialog(false);
      router.push("/");
    }
  };

  // Toggle setting
  const toggleSetting = <C extends keyof Settings>(
    category: C,
    setting: keyof Settings[C]
  ) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: !prev[category][setting],
      },
    }));
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-primary-500 text-white">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push("/dashboard")}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">
            <FormattedMessage id="profile.title" defaultMessage="Profile" />
          </h1>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        {/* User profile section */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Image
                src="/placeholder.svg?height=80&width=80"
                width={80}
                height={80}
                alt="Profile"
                className="rounded-full"
              />
              <button className="absolute bottom-0 right-0 bg-gray-100 p-1 rounded-full border border-gray-200">
                <Settings className="h-4 w-4 text-gray-600" />
              </button>
            </div>

            <div>
              <h2 className="font-bold text-xl">
                {user?.username || intl.formatMessage({ id: "profile.user.default", defaultMessage: "User" })}
              </h2>
              <p className="text-gray-600">
                {primaryEmail || "user@example.com"}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-medium">{userData.xp} XP</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-orange-500">🔥</span>
                  <span className="font-medium">
                    <FormattedMessage
                      id="profile.streak.days"
                      defaultMessage="{days} days"
                      values={{ days: userData.streak }}
                    />
                  </span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
                  <span className="font-medium">
                    <FormattedMessage
                      id="profile.hearts.count"
                      defaultMessage="{hearts} hearts"
                      values={{ hearts: userData.hearts }}
                    />
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <m.div
              whileHover={{ scale: 1.02 }}
              className="p-4 border border-gray-200 rounded-xl bg-blue-50"
            >
              <h3 className="font-bold mb-1">
                <FormattedMessage id="profile.stats.level" defaultMessage="Level" />
              </h3>
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor(userData.xp / 1000) + 1}
              </div>
            </m.div>

            <m.div
              whileHover={{ scale: 1.02 }}
              className="p-4 border border-gray-200 rounded-xl bg-green-50"
            >
              <h3 className="font-bold mb-1">
                <FormattedMessage id="profile.stats.completed" defaultMessage="Completed Lessons" />
              </h3>
              <div className="text-2xl font-bold text-green-600">
                {Math.floor(userData.xp / 100)}
              </div>
            </m.div>

            {/* <m.div
              whileHover={{ scale: 1.02 }}
              className="p-4 border border-gray-200 rounded-xl bg-purple-50"
            >
              <h3 className="font-bold mb-1">Abonnement</h3>
              <div className="text-xl font-bold text-purple-600">
                {user.subscription === "premium" ? "Premium" : "Free"}
              </div>
            </m.div> */}
          </div>
        </div>

        {/* Settings sections */}
        <div className="space-y-8">
          {/* Notifications */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell className="h-5 w-5 text-blue-500" />
              <h2 className="font-bold text-lg">
                <FormattedMessage id="settings.notifications.title" defaultMessage="Notifications" />
              </h2>
            </div>

            <div className="space-y-4 pl-7">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    <FormattedMessage id="settings.notifications.daily.title" defaultMessage="Daily Reminder" />
                  </h3>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage id="settings.notifications.daily.description" defaultMessage="Receive a reminder to practice each day" />
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.dailyReminder}
                  onCheckedChange={() =>
                    toggleSetting("notifications", "dailyReminder")
                  }
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    <FormattedMessage id="settings.notifications.weekly.title" defaultMessage="Weekly Progress" />
                  </h3>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage id="settings.notifications.weekly.description" defaultMessage="Receive a summary of your progress each week" />
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyProgress}
                  onCheckedChange={() =>
                    toggleSetting("notifications", "weeklyProgress")
                  }
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    <FormattedMessage id="settings.notifications.features.title" defaultMessage="New Features" />
                  </h3>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage id="settings.notifications.features.description" defaultMessage="Be informed about new features" />
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.newFeatures}
                  onCheckedChange={() =>
                    toggleSetting("notifications", "newFeatures")
                  }
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    <FormattedMessage id="settings.notifications.friends.title" defaultMessage="Friend Activity" />
                  </h3>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage id="settings.notifications.friends.description" defaultMessage="Receive notifications about your friends' activity" />
                  </p>
                </div>
                <Switch
                  checked={settings.notifications.friendActivity}
                  onCheckedChange={() =>
                    toggleSetting("notifications", "friendActivity")
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Accessibility */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Settings className="h-5 w-5 text-green-500" />
              <h2 className="font-bold text-lg">
                <FormattedMessage id="settings.accessibility.title" defaultMessage="Accessibility" />
              </h2>
            </div>

            <div className="space-y-4 pl-7">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    <FormattedMessage id="settings.accessibility.contrast.title" defaultMessage="High Contrast" />
                  </h3>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage id="settings.accessibility.contrast.description" defaultMessage="Increases contrast for better readability" />
                  </p>
                </div>
                <Switch
                  checked={settings.accessibility.highContrast}
                  onCheckedChange={() =>
                    toggleSetting("accessibility", "highContrast")
                  }
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    <FormattedMessage id="settings.accessibility.text.title" defaultMessage="Larger Text" />
                  </h3>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage id="settings.accessibility.text.description" defaultMessage="Increases text size throughout the app" />
                  </p>
                </div>
                <Switch
                  checked={settings.accessibility.largeText}
                  onCheckedChange={() =>
                    toggleSetting("accessibility", "largeText")
                  }
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    <FormattedMessage id="settings.accessibility.animations.title" defaultMessage="Reduce Animations" />
                  </h3>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage id="settings.accessibility.animations.description" defaultMessage="Reduces or disables animations" />
                  </p>
                </div>
                <Switch
                  checked={settings.accessibility.reducem}
                  onCheckedChange={() =>
                    toggleSetting("accessibility", "reducem")
                  }
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    <FormattedMessage id="settings.accessibility.screen.title" defaultMessage="Screen Reader Compatibility" />
                  </h3>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage id="settings.accessibility.screen.description" defaultMessage="Optimizes the app for screen readers" />
                  </p>
                </div>
                <Switch
                  checked={settings.accessibility.screenReader}
                  onCheckedChange={() =>
                    toggleSetting("accessibility", "screenReader")
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Preferences */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="h-5 w-5 text-purple-500" />
              <h2 className="font-bold text-lg">
                <FormattedMessage id="settings.preferences.title" defaultMessage="Preferences" />
              </h2>
            </div>

            <div className="space-y-4 pl-7">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    <FormattedMessage id="settings.preferences.dark.title" defaultMessage="Dark Mode" />
                  </h3>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage id="settings.preferences.dark.description" defaultMessage="Use dark theme" />
                  </p>
                </div>
                <Switch
                  checked={settings.preferences.darkMode}
                  onCheckedChange={() =>
                    toggleSetting("preferences", "darkMode")
                  }
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    <FormattedMessage id="settings.preferences.sound.title" defaultMessage="Sound Effects" />
                  </h3>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage id="settings.preferences.sound.description" defaultMessage="Enable sound effects" />
                  </p>
                </div>
                <Switch
                  checked={settings.preferences.soundEffects}
                  onCheckedChange={() =>
                    toggleSetting("preferences", "soundEffects")
                  }
                />
              </div>

              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">
                    <FormattedMessage id="settings.preferences.voice.title" defaultMessage="Voice Over" />
                  </h3>
                  <p className="text-sm text-gray-500">
                    <FormattedMessage id="settings.preferences.voice.description" defaultMessage="Enable audio reading of phrases" />
                  </p>
                </div>
                <Switch
                  checked={settings.preferences.voiceOver}
                  onCheckedChange={() =>
                    toggleSetting("preferences", "voiceOver")
                  }
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Account actions */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-red-500" />
              <h2 className="font-bold text-lg">
                <FormattedMessage id="settings.danger.title" defaultMessage="Danger zone" />
              </h2>
            </div>

            <div className="flex justify-between w-full">
              <Button
                size="sm"
                variant="outline"
                className="justify-between"
                onClick={() => setShowLogoutDialog(true)}
              >
                <div role="button" className="flex items-center gap-2">
                  <LogOut className="h-4 w-4 text-gray-500" />
                  <span>
                    <FormattedMessage id="settings.logout.button" defaultMessage="Log Out" />
                  </span>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </Button>

              <Button
                variant="outline"
                size="sm"
                className="w-full justify-between text-red-500 hover:text-red-600 hover:bg-red-50"
                onClick={() => setShowDeleteDialog(true)}
              >
                <div className="flex items-center gap-2">
                  <Trash2 className="h-4 w-4" />
                  <span>
                    <FormattedMessage id="settings.delete.button" defaultMessage="Delete Account" />
                  </span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Logout dialog */}
      <Dialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              <FormattedMessage id="dialog.logout.title" defaultMessage="Log Out" />
            </DialogTitle>
            <DialogDescription>
              <FormattedMessage id="dialog.logout.description" defaultMessage="Are you sure you want to log out? You can log back in at any time." />
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              <FormattedMessage id="dialog.logout.cancel" defaultMessage="Cancel" />
            </Button>
            <Button
              variant="default"
              disabled={isLoading}
              onClick={handleLogout}
            >
              <FormattedMessage id="dialog.logout.confirm" defaultMessage="Log Out" />
              {isLoading && <Loader2 className="animate-spin" />}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete account dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="w-full">
          <DialogHeader>
            <DialogTitle className="text-red-500">
              <FormattedMessage id="dialog.delete.title" defaultMessage="Delete Account" />
            </DialogTitle>
            <DialogDescription>
              <FormattedMessage id="dialog.delete.description" defaultMessage="This action is irreversible. All your data, including your progress, will be permanently deleted." />
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-500 mb-2">
              <FormattedMessage id="dialog.delete.confirmation" defaultMessage="To confirm, please type 'DELETE' below:" />
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder={intl.formatMessage({ id: "dialog.delete.placeholder", defaultMessage: "DELETE" })}
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              <FormattedMessage id="dialog.delete.cancel" defaultMessage="Cancel" />
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== "DELETE"}
            >
              <FormattedMessage id="dialog.delete.confirm" defaultMessage="Delete Permanently" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

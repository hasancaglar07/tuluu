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
    toast.success("You logged out", {
      description: "Catch you later, alligator! 🐶​",
      // Optional: custom styling to make it look like a variant
      className: "bg-warning-500", // you can define custom classes for different variants (like success, error, etc.)
      closeButton: true, // Optional: Adds a close button
      position: "top-center", // Optional: Position the toast (can be top-right, top-center, etc.)
      duration: 10000, // Optional: auto close after 5 seconds
    });

    setShowLogoutDialog(false);
    setIsLoading(false);
    router.push("/");
  };

  // Handle account deletion
  const handleDeleteAccount = () => {
    if (deleteConfirmation === "SUPPRIMER") {
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
          <h1 className="text-xl font-bold">Profil</h1>
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
                {user?.username || "Utilisateur"}
              </h2>
              <p className="text-gray-600">
                {primaryEmail || "utilisateur@example.com"}
              </p>
              <div className="flex items-center gap-4 mt-1">
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-yellow-500">⭐</span>
                  <span className="font-medium">{userData.xp} XP</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <span className="text-orange-500">🔥</span>
                  <span className="font-medium">{userData.streak} jours</span>
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <Heart className="h-4 w-4 text-red-500" fill="currentColor" />
                  <span className="font-medium">{userData.hearts} cœurs</span>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <m.div
              whileHover={{ scale: 1.02 }}
              className="p-4 border border-gray-200 rounded-xl bg-blue-50"
            >
              <h3 className="font-bold mb-1">Niveau</h3>
              <div className="text-2xl font-bold text-blue-600">
                {Math.floor(userData.xp / 1000) + 1}
              </div>
            </m.div>

            <m.div
              whileHover={{ scale: 1.02 }}
              className="p-4 border border-gray-200 rounded-xl bg-green-50"
            >
              <h3 className="font-bold mb-1">Leçons complétées</h3>
              <div className="text-2xl font-bold text-green-600">
                {/* This would come from progress state in a real app */}
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
              <h2 className="font-bold text-lg">Notifications</h2>
            </div>

            <div className="space-y-4 pl-7">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Rappel quotidien</h3>
                  <p className="text-sm text-gray-500">
                    Recevez un rappel pour pratiquer chaque jour
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
                  <h3 className="font-medium">Progrès hebdomadaire</h3>
                  <p className="text-sm text-gray-500">
                    Recevez un résumé de vos progrès chaque semaine
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
                  <h3 className="font-medium">Nouvelles fonctionnalités</h3>
                  <p className="text-sm text-gray-500">
                    Soyez informé des nouvelles fonctionnalités
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
                  <h3 className="font-medium">Activité des amis</h3>
                  <p className="text-sm text-gray-500">
                    Recevez des notifications sur l&apos;activité de vos amis
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
              <h2 className="font-bold text-lg">Accessibilité</h2>
            </div>

            <div className="space-y-4 pl-7">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Contraste élevé</h3>
                  <p className="text-sm text-gray-500">
                    Augmente le contraste pour une meilleure lisibilité
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
                  <h3 className="font-medium">Texte plus grand</h3>
                  <p className="text-sm text-gray-500">
                    Augmente la taille du texte dans l&paos;application
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
                  <h3 className="font-medium">Réduire les animations</h3>
                  <p className="text-sm text-gray-500">
                    Réduit ou désactive les animations
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
                    Compatibilité lecteur d&apos;écran
                  </h3>
                  <p className="text-sm text-gray-500">
                    Optimise l&apos;application pour les lecteurs d&apos;écran
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
              <h2 className="font-bold text-lg">Préférences</h2>
            </div>

            <div className="space-y-4 pl-7">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Mode sombre</h3>
                  <p className="text-sm text-gray-500">
                    Utiliser le thème sombre
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
                  <h3 className="font-medium">Effets sonores</h3>
                  <p className="text-sm text-gray-500">
                    Activer les effets sonores
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
                  <h3 className="font-medium">Voix off</h3>
                  <p className="text-sm text-gray-500">
                    Activer la lecture audio des phrases
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
              <h2 className="font-bold text-lg">Compte</h2>
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
                  <span>Se déconnecter</span>
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
                  <span>Supprimer mon compte</span>
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
            <DialogTitle>Se déconnecter</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir vous déconnecter ? Vous pourrez vous
              reconnecter à tout moment.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="default"
              disabled={isLoading}
              onClick={handleLogout}
            >
              Se déconnecter
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
              Supprimer mon compte
            </DialogTitle>
            <DialogDescription>
              Cette action est irréversible. Toutes vos données, y compris votre
              progression, seront définitivement supprimées.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <p className="text-sm text-gray-500 mb-2">
              Pour confirmer, veuillez saisir &apos;SUPPRIMER&apos; ci-dessous :
            </p>
            <input
              type="text"
              value={deleteConfirmation}
              onChange={(e) => setDeleteConfirmation(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="SUPPRIMER"
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
            >
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirmation !== "SUPPRIMER"}
            >
              Supprimer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

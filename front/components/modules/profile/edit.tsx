"use client";

import { useState, useEffect } from "react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { useFormik } from "formik";
import * as z from "zod";
import { toFormikValidationSchema } from "zod-formik-adapter";
import { useAuth, useClerk, useUser } from "@clerk/nextjs";
import { useIntl } from "react-intl";
import { toast } from "sonner"; // or your toast library

import { FormattedMessage } from "react-intl";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Import sub-components
import { ProfileHeader } from "./profile-header";
import { BasicInfoForm } from "./basic-info-form";
import { LocationLanguageForm } from "./location-language-form";
import { NotificationsSettings } from "./notifications-settings";
import { PreferencesSettings } from "./preferences-settings";
import { DangerZone } from "./danger-zone";
import { LogoutDialog } from "./logout-dialog";
import { DeleteAccountDialog } from "./delete-account-dialog";
import Loading from "@/components/custom/loading";
import { AccessibilitySettings } from "./accessibility-settings";
import { apiClient } from "@/lib/api-client";
import ValuePointsPanel from "../Course/ValuePointsPanel";

/**
 * Type definition for user settings structure
 * Organizes settings into three main categories: notifications, accessibility, and preferences
 */
export type Settings = {
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

/**
 * Zod validation schema for profile form
 * Ensures data integrity and provides client-side validation
 */
const profileSchema = z.object({
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  name: z.string().min(2, "Name must be at least 2 characters"),
  avatar: z.string().url("Please enter a valid URL"),
  country: z.string().min(1, "Please select a country"),
  language: z.string().min(1, "Please select a language"),
  timezone: z.string().min(1, "Please select a timezone"),
  userName: z.string(),
  settings: z.object({
    notifications: z.object({
      dailyReminder: z.boolean(),
      weeklyProgress: z.boolean(),
      newFeatures: z.boolean(),
      friendActivity: z.boolean(),
    }),
    accessibility: z.object({
      highContrast: z.boolean(),
      largeText: z.boolean(),
      reducem: z.boolean(),
      screenReader: z.boolean(),
    }),
    preferences: z.object({
      darkMode: z.boolean(),
      soundEffects: z.boolean(),
      voiceOver: z.boolean(),
    }),
  }),
});

/**
 * ProfileEdit Component
 *
 * Main component for editing user profile information and settings.
 * Features:
 * - Profile information editing (name, bio, avatar, location)
 * - Settings management (notifications, accessibility, preferences)
 * - Account management (logout, delete account)
 * - Form validation with Zod
 * - Internationalization with react-intl
 * - Integration with Clerk authentication
 */
export default function ProfileEdit() {
  const router = useLocalizedRouter();
  const { user, isLoaded } = useUser();

  // Component state management
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState("");

  const { signOut } = useClerk();
  const { getToken } = useAuth();
  const intl = useIntl();

  /**
   * Handles user logout process
   * Signs out the user and redirects to home page with success message
   */
  const handleLogout = async () => {
    setIsLoading(true);
    await signOut();
    toast.success(
      intl.formatMessage({
        id: "logout.success",
        defaultMessage: "You logged out",
      }),
      {
        description: intl.formatMessage({
          id: "logout.success.description",
          defaultMessage: "Catch you later, alligator! 🐶​",
        }),
      }
    );

    setShowLogoutDialog(false);
    setIsLoading(false);
    router.push("/");
  };

  /**
   * Handles account deletion process
   * Requires user confirmation and makes API call to delete account
   */
  const handleDeleteAccount = async () => {
    setIsLoading(true);
    if (deleteConfirmation === "DELETE") {
      try {
        const token = await getToken();
        const response = await apiClient.delete("/api/users/profile", {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });
        return response.data;
      } catch (error) {
        console.error("Delete account failed:", error);
        throw error;
      }
    }
    await signOut();
    setIsLoading(false);
    toast.warning(
      intl.formatMessage({
        id: "account.deleted",
        defaultMessage: "Account deleted",
      }),
      {
        description: intl.formatMessage({
          id: "account.deleted.description",
          defaultMessage: "Your journey ends here... but we'll miss you! 💔",
        }),
      }
    );
  };

  /**
   * Formik configuration for form state management and validation
   * Handles form submission, validation, and API integration
   */
  const formik = useFormik({
    initialValues: {
      bio: "",
      name: "",
      avatar: "",
      country: "",
      language: "",
      timezone: "",
      status: "",
      userName: "",
      settings: {
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
      },
    },
    validationSchema: toFormikValidationSchema(profileSchema),
    onSubmit: async (values) => {
      setIsLoading(true);
      try {
        const token = await getToken();
        const response = await apiClient.put(
          "/api/users/profile",
          {
            name: values.name,
            bio: values.bio,
            country: values.country,
            language: values.language,
            timezone: values.timezone,
            avatar: values.avatar,
            userName: values.userName,
            settings: values.settings,
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );
        toast.success(
          intl.formatMessage({
            id: "profile.updated",
            defaultMessage: "Profile updated!",
          })
        );
        return response.data;
      } catch (error) {
        console.error("Error updating profile:", error);
        toast.error(
          intl.formatMessage({
            id: "profile.update.failed",
            defaultMessage: "Failed to update profile",
          })
        );
      } finally {
        setIsLoading(false);
      }
    },
  });

  /**
   * Load user data when component mounts
   * Populates form with existing user data from Clerk
   */
  useEffect(() => {
    if (isLoaded && user) {
      const metadata = user.publicMetadata;

      formik.setValues({
        status: (metadata.status as string) || "",
        bio: (metadata.bio as string) || "",
        name: user.fullName || "",
        avatar: (metadata.avatar as string) || user.imageUrl,
        country: (metadata.country as string) || "US",
        language: (metadata.language as string) || "en-US",
        timezone: (metadata.timezone as string) || "America/New_York",
        userName: user.id,
        settings: (metadata.settings as Settings) || {
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
        },
      });
    }
  }, [isLoaded, user]);

  /**
   * Toggle a specific setting in the nested settings object
   * @param category - The settings category (notifications, accessibility, preferences)
   * @param setting - The specific setting to toggle
   */
  const toggleSetting = <C extends keyof Settings>(
    category: C,
    setting: keyof Settings[C]
  ) => {
    const fieldPath = `settings.${String(category)}.${String(setting)}`;
    formik.setFieldValue(fieldPath, !formik.values.settings[category][setting]);
  };

  // Show loading spinner while user data is being loaded
  if (!isLoaded || !formik.values.country) {
    return <Loading />;
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header Component */}
      <ProfileHeader
        isLoading={isLoading}
        isValid={formik.isValid}
        onSave={() => formik.handleSubmit()}
        onBack={() => router.push("/dashboard")}
      />

      {/* Main content */}
      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        <form onSubmit={formik.handleSubmit}>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile">
                <FormattedMessage
                  id="tabs.profile"
                  defaultMessage="Profile Information"
                />
              </TabsTrigger>
              <TabsTrigger value="settings">
                <FormattedMessage
                  id="tabs.settings"
                  defaultMessage="Settings"
                />
              </TabsTrigger>
            </TabsList>

            {/* Profile Information Tab */}
            <TabsContent value="profile" className="mt-6 space-y-6">
              <BasicInfoForm formik={formik} />
              <LocationLanguageForm formik={formik} />
            </TabsContent>

            {/* Settings Tab */}
            <TabsContent value="settings" className="mt-6 space-y-6">
              <NotificationsSettings
                settings={formik.values.settings.notifications}
                toggleSetting={(setting) =>
                  toggleSetting("notifications", setting)
                }
              />
              <AccessibilitySettings
                settings={formik.values.settings.accessibility}
                toggleSetting={(setting) =>
                  toggleSetting("accessibility", setting)
                }
              />
              <PreferencesSettings
                settings={formik.values.settings.preferences}
                toggleSetting={(setting) =>
                  toggleSetting("preferences", setting)
                }
              />
              <DangerZone
                onLogout={() => setShowLogoutDialog(true)}
                onDelete={() => setShowDeleteDialog(true)}
              />
            </TabsContent>
          </Tabs>
        </form>

        <div className="mt-10">
          <ValuePointsPanel />
        </div>
      </div>

      {/* Dialog Components */}
      <LogoutDialog
        isOpen={showLogoutDialog}
        isLoading={isLoading}
        onClose={() => setShowLogoutDialog(false)}
        onLogout={handleLogout}
      />

      <DeleteAccountDialog
        isOpen={showDeleteDialog}
        isLoading={isLoading}
        confirmation={deleteConfirmation}
        onConfirmationChange={setDeleteConfirmation}
        onClose={() => setShowDeleteDialog(false)}
        onDelete={handleDeleteAccount}
      />
    </div>
  );
}

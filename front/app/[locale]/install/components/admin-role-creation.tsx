"use client";

import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Shield,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
  Loader2,
  User,
  UserCheck,
  Settings,
} from "lucide-react";

interface AdminRoleCreationProps {
  clerkData: any;
  onComplete: (data: any) => void;
  onBack: () => void;
  onLoading: (loading: boolean) => void;
}

export default function AdminRoleCreation({
  clerkData,
  onComplete,
  onBack,
  onLoading,
}: AdminRoleCreationProps) {
  const { user, isLoaded } = useUser();
  const [step, setStep] = useState("ready"); // ready, updating-public, updating-private, completed
  const [logs, setLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [updatedMetadata, setUpdatedMetadata] = useState({
    publicMetadata: null,
    privateMetadata: null,
  });

  const addLog = (
    message: string,
    type: "info" | "success" | "error" = "info"
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  useEffect(() => {
    if (isLoaded && user) {
      addLog(`Connected user: ${user.fullName || user.firstName}`, "success");
      addLog(`User ID: ${user.id}`, "info");
      addLog(`Email: ${user.emailAddresses?.[0]?.emailAddress}`, "info");
    }
  }, [isLoaded, user]);

  const updatePublicMetadata = async () => {
    setStep("updating-public");
    addLog("Updating public metadata...");

    try {
      const publicMetadata = {
        bio: "",
        name:
          user?.fullName ||
          `${user?.firstName || ""} ${user?.lastName || ""}`.trim(),
        avatar: user?.imageUrl || "",
        country: "US",
        language: "en-US",
        settings: {
          preferences: {
            darkMode: false,
            voiceOver: false,
            soundEffects: true,
          },
          accessibility: {
            reducem: false,
            largeText: false,
            highContrast: false,
            screenReader: false,
          },
          notifications: {
            newFeatures: false,
            dailyReminder: false,
            friendActivity: false,
            weeklyProgress: false,
          },
        },
        timezone: "UTC",
      };

      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/install/update-public-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            publicMetadata,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        addLog("✓ Public metadata updated successfully", "success");
        addLog("✓ User profile settings configured", "success");
        setUpdatedMetadata((prev) => ({
          ...prev,
          publicMetadata: data.metadata,
        }));
        return true;
      } else {
        throw new Error(data.error || "Failed to update public metadata");
      }
    } catch (error) {
      console.error("Failed to update public metadata:", error);
      addLog(`✗ Public metadata update failed: ${error.message}`, "error");
      return false;
    }
  };

  const updatePrivateMetadata = async () => {
    setStep("updating-private");
    addLog("Updating private metadata with admin privileges...");

    try {
      const privateMetadata = {
        role: "admin",
        status: "active",
        subscription: "free",
        subscriptionStatus: "active",
      };

      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL +
          "/api/install/update-private-metadata",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId: user?.id,
            privateMetadata,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        addLog("✓ Private metadata updated successfully", "success");
        addLog("✓ Admin role assigned", "success");
        addLog("✓ Subscription status configured", "success");
        setUpdatedMetadata((prev) => ({
          ...prev,
          privateMetadata: data.metadata,
        }));
        return true;
      } else {
        throw new Error(data.error || "Failed to update private metadata");
      }
    } catch (error) {
      console.error("Failed to update private metadata:", error);
      addLog(`✗ Private metadata update failed: ${error.message}`, "error");
      return false;
    }
  };

  const createAdminRole = async () => {
    if (!user) {
      addLog("✗ No user connected", "error");
      return;
    }

    setIsProcessing(true);
    onLoading(true);
    addLog("Starting admin role creation process...");

    try {
      // Step 1: Update public metadata
      const publicSuccess = await updatePublicMetadata();
      if (!publicSuccess) {
        throw new Error("Failed to update public metadata");
      }

      // Step 2: Update private metadata
      const privateSuccess = await updatePrivateMetadata();
      if (!privateSuccess) {
        throw new Error("Failed to update private metadata");
      }

      // Step 3: Complete
      setStep("completed");
      addLog("✓ Admin role creation completed successfully!", "success");

      onComplete({
        roleCreated: true,
        adminUser: {
          id: user.id,
          fullName: user.fullName,
          firstName: user.firstName,
          lastName: user.lastName,
          emailAddresses: user.emailAddresses,
          imageUrl: user.imageUrl,
        },
        updatedMetadata,
      });
    } catch (error) {
      console.error("Admin role creation failed:", error);
      addLog(`✗ Admin role creation failed: ${error.message}`, "error");
      setStep("ready");
    } finally {
      setIsProcessing(false);
      onLoading(false);
    }
  };

  const getStepBadge = () => {
    switch (step) {
      case "completed":
        return <Badge className="bg-green-500">✓ Completed</Badge>;
      case "updating-public":
        return <Badge className="bg-blue-500">Updating Profile...</Badge>;
      case "updating-private":
        return <Badge className="bg-blue-500">Assigning Admin Role...</Badge>;
      default:
        return <Badge variant="secondary">Ready</Badge>;
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case "success":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error":
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      default:
        return <div className="w-4 h-4 rounded-full bg-blue-500" />;
    }
  };

  if (!isLoaded) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
            <p>Loading user information...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No user connected. Please go back and sign in first.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-6 h-6" />
          Create Admin Role
        </CardTitle>
        <CardDescription>
          Update user metadata to grant admin privileges to the connected
          account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current User Info */}
        <div className="p-4 border rounded-lg bg-gray-50">
          <div className="flex items-center gap-3 mb-3">
            <User className="w-5 h-5 text-gray-600" />
            <h3 className="font-medium">Connected User</h3>
            <Badge className="bg-green-500">✓ Authenticated</Badge>
          </div>
          <div className="flex items-center gap-3">
            <img
              src={user.imageUrl || "/placeholder.svg?height=40&width=40"}
              alt="Profile"
              className="w-10 h-10 rounded-full"
            />
            <div>
              <p className="font-medium">{user.fullName || user.firstName}</p>
              <p className="text-sm text-gray-500">
                {user.emailAddresses?.[0]?.emailAddress}
              </p>
              <p className="text-xs text-gray-400">ID: {user.id}</p>
            </div>
          </div>
        </div>

        {/* Admin Role Creation Status */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-medium">Admin Role Creation Status</h3>
            {getStepBadge()}
          </div>

          {/* Ready State */}
          {step === "ready" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Ready to create admin role for the connected user. This will
                update both public and private metadata.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <h4 className="font-medium text-blue-900 mb-2">
                  What will be updated:
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                  <div>
                    <h5 className="font-medium mb-1">Public Metadata:</h5>
                    <ul className="space-y-1 text-xs">
                      <li>• Profile settings and preferences</li>
                      <li>• User display name and avatar</li>
                      <li>• Language and timezone settings</li>
                      <li>• Notification preferences</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium mb-1">Private Metadata:</h5>
                    <ul className="space-y-1 text-xs">
                      <li>• Role: admin</li>
                      <li>• Status: active</li>
                      <li>• Subscription: free</li>
                      <li>• Subscription Status: active</li>
                    </ul>
                  </div>
                </div>
              </div>
              <Button
                onClick={createAdminRole}
                disabled={isProcessing}
                className="w-full"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating Admin Role...
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4 mr-2" />
                    Create Admin Role
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Processing States */}
          {(step === "updating-public" || step === "updating-private") && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-blue-600">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {step === "updating-public" &&
                    "Updating user profile settings..."}
                  {step === "updating-private" &&
                    "Assigning admin privileges..."}
                </span>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  Please wait while we update the user metadata. This process
                  should complete within a few seconds.
                </p>
              </div>
            </div>
          )}

          {/* Completed State */}
          {step === "completed" && (
            <div className="space-y-3">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Admin role created successfully! The user now has admin
                  privileges and full access to administrative features.
                </AlertDescription>
              </Alert>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-2">
                    ✓ Public Metadata Updated
                  </h5>
                  <ul className="space-y-1 text-xs text-green-800">
                    <li>• Profile settings configured</li>
                    <li>• User preferences set</li>
                    <li>• Display information updated</li>
                  </ul>
                </div>
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <h5 className="font-medium text-green-900 mb-2">
                    ✓ Private Metadata Updated
                  </h5>
                  <ul className="space-y-1 text-xs text-green-800">
                    <li>• Admin role assigned</li>
                    <li>• Account status: active</li>
                    <li>• Subscription configured</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Process Logs */}
        {logs.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Process Logs
            </h4>
            <ScrollArea className="h-40 w-full border rounded p-3 bg-gray-50">
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    {getLogIcon(log.type)}
                    <div className="flex-1">
                      <span className="text-gray-500 text-xs">
                        [{log.timestamp}]
                      </span>
                      <span
                        className={`ml-2 ${
                          log.type === "error" ? "text-red-600" : ""
                        }`}
                      >
                        {log.message}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between w-full">
          <Button variant="outline" onClick={onBack} disabled={isProcessing}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {step === "completed" && (
            <Button
              onClick={() =>
                onComplete({
                  roleCreated: true,
                  adminUser: {
                    id: user.id,
                    fullName: user.fullName,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    emailAddresses: user.emailAddresses,
                    imageUrl: user.imageUrl,
                  },
                  updatedMetadata,
                })
              }
              className="flex-1"
            >
              Continue to Installation Summary
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

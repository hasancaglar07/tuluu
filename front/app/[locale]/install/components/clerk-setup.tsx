"use client";

import { useState, useEffect } from "react";
import { useAuth, useUser } from "@clerk/nextjs";
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
  UserPlus,
  ArrowLeft,
  CheckCircle,
  Info,
  Loader2,
  AlertTriangle,
  Key,
  Globe,
  User,
} from "lucide-react";

interface ClerkSetupProps {
  environmentData: any;
  onComplete: (data: any) => void;
  onBack: () => void;
  onLoading: (loading: boolean) => void;
}

export default function ClerkSetup({
  environmentData,
  onComplete,
  onBack,
  onLoading,
}: ClerkSetupProps) {
  const { isSignedIn, isLoaded } = useAuth();
  const { user } = useUser();
  const [clerkStatus, setClerkStatus] = useState("checking"); // checking, connected, disconnected, error
  const [clerkInfo, setClerkInfo] = useState(null);
  const [logs, setLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = (
    message: string,
    type: "info" | "success" | "error" = "info"
  ) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, { timestamp, message, type }]);
  };

  useEffect(() => {
    if (isLoaded) {
      checkClerkConnection();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (isSignedIn && user) {
      addLog("✓ User signed in successfully", "success");
      addLog(`✓ User: ${user.fullName || user.firstName}`, "success");
      addLog(`✓ Email: ${user.emailAddresses?.[0]?.emailAddress}`, "success");
    }
  }, [isSignedIn, user]);

  const checkClerkConnection = async () => {
    setIsProcessing(true);
    onLoading(true);
    addLog("Checking Clerk connection...");

    try {
      // Check if Clerk is properly configured
      const clerkResponse = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/install/check-clerk-connection"
      );
      const clerkData = await clerkResponse.json();

      if (clerkData.connected) {
        setClerkStatus("connected");
        setClerkInfo(clerkData.info);
        addLog("✓ Clerk connection successful", "success");
        addLog(`✓ Application ID: ${clerkData.info.applicationId}`, "success");
      } else {
        setClerkStatus("disconnected");
        addLog("✗ Clerk connection failed", "error");
        addLog(`Error: ${clerkData.error}`, "error");
      }
    } catch (error) {
      console.error("Failed to check Clerk connection:", error);
      setClerkStatus("error");
      addLog(`✗ Connection error: ${error.message}`, "error");
    } finally {
      setIsProcessing(false);
      onLoading(false);
    }
  };

  const handleSignIn = () => {
    addLog("Redirecting to Clerk sign-in...");
    // Use Clerk's built-in sign-in redirect
    window.location.href =
      "/sign-up?redirect_url=" + encodeURIComponent(window.location.href);
  };

  const handleContinue = () => {
    onComplete({
      clerkConnected: true,
      clerkInfo,
      user: {
        id: user?.id,
        firstName: user?.firstName,
        lastName: user?.lastName,
        fullName: user?.fullName,
        emailAddresses: user?.emailAddresses,
        imageUrl: user?.imageUrl,
      },
      authStatus: "authenticated",
    });
  };

  const getClerkStatusBadge = () => {
    switch (clerkStatus) {
      case "connected":
        return <Badge className="bg-green-500">✓ Connected</Badge>;
      case "disconnected":
        return <Badge variant="destructive">✗ Disconnected</Badge>;
      case "error":
        return <Badge variant="destructive">✗ Error</Badge>;
      default:
        return <Badge variant="outline">Checking...</Badge>;
    }
  };

  const getAuthStatusBadge = () => {
    if (!isLoaded) return <Badge variant="outline">Loading...</Badge>;
    if (isSignedIn)
      return <Badge className="bg-green-500">✓ Authenticated</Badge>;
    return <Badge variant="secondary">Not Signed In</Badge>;
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

  const canProceed = clerkStatus === "connected" && isSignedIn && user;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="w-6 h-6" />
          Setup Admin Account
        </CardTitle>
        <CardDescription>
          Connect to Clerk authentication service and authenticate your admin
          account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Clerk Connection Status */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Key className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium">Clerk Connection</h3>
            </div>
            {getClerkStatusBadge()}
          </div>

          {clerkStatus === "connected" && clerkInfo && (
            <div className="space-y-2 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-gray-600">
                    Application ID:
                  </span>
                  <code className="block bg-gray-100 px-2 py-1 rounded text-xs mt-1">
                    {clerkInfo.applicationId}
                  </code>
                </div>
                <div>
                  <span className="font-medium text-gray-600">
                    Environment:
                  </span>
                  <code className="block bg-gray-100 px-2 py-1 rounded text-xs mt-1">
                    {clerkInfo.environment || "development"}
                  </code>
                </div>
              </div>
            </div>
          )}

          {clerkStatus === "disconnected" && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Clerk connection failed. Please check your environment
                variables:
                <ul className="list-disc list-inside mt-2 text-xs">
                  <li>NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY</li>
                  <li>CLERK_SECRET_KEY</li>
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* User Authentication Status */}
        <div className="p-4 border rounded-lg">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-gray-600" />
              <h3 className="font-medium">User Authentication</h3>
            </div>
            {getAuthStatusBadge()}
          </div>

          {isSignedIn && user && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <img
                  src={user.imageUrl || "/placeholder.svg?height=40&width=40"}
                  alt="Profile"
                  className="w-10 h-10 rounded-full"
                />
                <div>
                  <p className="font-medium">
                    {user.fullName || user.firstName}
                  </p>
                  <p className="text-sm text-gray-500">
                    {user.emailAddresses?.[0]?.emailAddress}
                  </p>
                </div>
              </div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800">
                  ✓ Successfully authenticated with Clerk
                </p>
              </div>
            </div>
          )}

          {!isSignedIn && clerkStatus === "connected" && isLoaded && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                Please sign in to create your admin account
              </p>
              <Button
                onClick={handleSignIn}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Sign up with Clerk
              </Button>
            </div>
          )}

          {!isLoaded && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading authentication status...
            </div>
          )}
        </div>

        {/* Setup Instructions */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            <div className="space-y-2">
              <p>
                <strong>Setup Process:</strong>
              </p>
              <ol className="list-decimal list-inside space-y-1 ml-4 text-sm">
                <li>
                  Verify Clerk connection using your environment variables
                </li>
                <li>Sign in with your account to create admin user</li>
                <li>Proceed to create admin role and permissions</li>
              </ol>
            </div>
          </AlertDescription>
        </Alert>

        {/* Process Logs */}
        {logs.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">Setup Logs</h4>
            <ScrollArea className="h-32 w-full border rounded p-3 bg-gray-50">
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

          <Button
            variant="outline"
            onClick={checkClerkConnection}
            disabled={isProcessing}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Checking...
              </>
            ) : (
              <>
                <Globe className="w-4 h-4 mr-2" />
                Recheck Connection
              </>
            )}
          </Button>

          <Button
            onClick={handleContinue}
            disabled={!canProceed}
            className="flex-1"
          >
            Continue to Admin Role Creation
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

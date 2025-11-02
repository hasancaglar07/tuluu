"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import {
  BuildingIcon as Build,
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  RefreshCw,
  Terminal,
  AlertTriangle,
} from "lucide-react";

interface BuildProcessProps {
  packageManager: any;
  environment: any;
  onComplete: (data: any) => void;
  onBack: () => void;
  onLoading: (loading: boolean) => void;
}

export default function BuildProcess({
  packageManager,
  environment,
  onComplete,
  onBack,
  onLoading,
}: BuildProcessProps) {
  const [buildStatus, setBuildStatus] = useState({
    api: {
      status: "pending",
      logs: [],
      startTime: null,
      endTime: null,
      progress: 0,
      currentStep: "",
    },
    front: {
      status: "pending",
      logs: [],
      startTime: null,
      endTime: null,
      progress: 0,
      currentStep: "",
    },
  });
  const [currentBuild, setCurrentBuild] = useState(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [buildPhase, setBuildPhase] = useState(""); // "api", "frontend", "complete"
  const [overallProgress, setOverallProgress] = useState(0);

  const addLog = (app: "api" | "front", message: string, isError = false) => {
    setBuildStatus((prev) => ({
      ...prev,
      [app]: {
        ...prev[app],
        logs: [
          ...prev[app].logs,
          {
            message,
            timestamp: new Date().toLocaleTimeString(),
            isError,
          },
        ],
      },
    }));
  };

  const updateProgress = (
    app: "api" | "front",
    progress: number,
    step: string
  ) => {
    setBuildStatus((prev) => ({
      ...prev,
      [app]: {
        ...prev[app],
        progress,
        currentStep: step,
      },
    }));
  };

  const simulateBuildProgress = async (app: "api" | "front") => {
    const steps = [
      { progress: 10, step: "Initializing build..." },
      { progress: 25, step: "Installing dependencies..." },
      { progress: 40, step: "Compiling TypeScript..." },
      { progress: 60, step: "Building components..." },
      { progress: 80, step: "Optimizing bundle..." },
      { progress: 95, step: "Finalizing build..." },
      { progress: 100, step: "Build complete!" },
    ];

    for (const { progress, step } of steps) {
      updateProgress(app, progress, step);
      addLog(app, `📦 ${step}`);
      await new Promise((resolve) =>
        setTimeout(resolve, 800 + Math.random() * 400)
      );
    }
  };

  const buildApp = async (app: "api" | "front") => {
    setBuildStatus((prev) => ({
      ...prev,
      [app]: {
        ...prev[app],
        status: "building",
        startTime: new Date(),
        logs: [],
        progress: 0,
        currentStep: "Starting build...",
      },
    }));

    addLog(app, `🚀 Starting ${app} build process...`);
    addLog(
      app,
      `📋 Using ${
        packageManager ? packageManager.packageManager : "bun"
      } as package manager`
    );

    try {
      // Start progress simulation
      const progressPromise = simulateBuildProgress(app);

      // Make actual API call
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/install/build-app",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            app: app,
            packageManager: packageManager
              ? packageManager.packageManager
              : "bun",
          }),
        }
      );

      const result = await response.json();

      // Wait for progress simulation to complete
      await progressPromise;

      if (result.success) {
        setBuildStatus((prev) => ({
          ...prev,
          [app]: {
            ...prev[app],
            status: "success",
            endTime: new Date(),
            progress: 100,
            currentStep: "Build completed successfully!",
          },
        }));
        addLog(app, "✅ Build completed successfully!");

        // Add actual build logs if available
        if (result.logs && result.logs.length > 0) {
          result.logs.forEach((log) => addLog(app, log));
        }
      } else {
        // Enhanced error handling with detailed server response
        const errorMessage = result.error || "Build failed";
        const errorDetails =
          result.details || "No additional details available";

        addLog(app, `❌ Server Error: ${errorMessage}`, true);
        addLog(app, `Details: ${errorDetails}`, true);

        // Add server logs if available
        if (result.logs && result.logs.length > 0) {
          addLog(app, "--- SERVER BUILD LOGS ---", true);
          result.logs.forEach((log) => addLog(app, log, true));
        }

        // Add any additional error data
        if (result.stderr) {
          addLog(app, "--- BUILD STDERR ---", true);
          addLog(app, result.stderr, true);
        }

        if (result.stdout) {
          addLog(app, "--- BUILD STDOUT ---", true);
          addLog(app, result.stdout, true);
        }

        throw new Error(`${errorMessage}: ${errorDetails}`);
      }

      return result;
    } catch (error) {
      setBuildStatus((prev) => ({
        ...prev,
        [app]: {
          ...prev[app],
          status: "failed",
          endTime: new Date(),
          currentStep: "Build failed",
        },
      }));

      // Enhanced error logging with detailed information
      addLog(app, `❌ Build failed: ${error.message}`, true);

      // Add detailed error information if available
      if (error.response) {
        addLog(app, `HTTP Status: ${error.response.status}`, true);
        addLog(app, `Response: ${JSON.stringify(error.response.data)}`, true);
      }

      // Add stdout/stderr if available from exec errors
      if (error.stdout) {
        addLog(app, "--- STDOUT ---", true);
        addLog(app, error.stdout, true);
      }

      if (error.stderr) {
        addLog(app, "--- STDERR ---", true);
        addLog(app, error.stderr, true);
      }

      // Add stack trace for debugging
      if (error.stack) {
        addLog(app, "--- STACK TRACE ---", true);
        addLog(app, error.stack, true);
      }

      throw error;
    }
  };

  const startBuild = async () => {
    setIsBuilding(true);
    onLoading(true);
    setOverallProgress(0);

    try {
      // Build API first
      setBuildPhase("api");
      setCurrentBuild("api");
      addLog("api", "🔧 Preparing API build environment...");

      const apiResult = await buildApp("api");
      setOverallProgress(50);

      // Build Frontend
      setBuildPhase("frontend");
      setCurrentBuild("front");
      addLog("front", "🔧 Preparing Frontend build environment...");

      const frontResult = await buildApp("front");
      setOverallProgress(90);

      // Get deployment URLs
      setBuildPhase("complete");
      addLog("api", "🌐 Fetching deployment URLs...");
      const urlsResponse = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/install/get-deployment-urls"
      );
      const urlsData = await urlsResponse.json();
      setOverallProgress(100);

      onComplete({
        buildResults: {
          api: apiResult,
          front: frontResult,
        },
        deploymentUrls: urlsData.urls,
      });
    } catch (error) {
      console.error("Build process failed:", error);
      setOverallProgress(0);
    } finally {
      setIsBuilding(false);
      setCurrentBuild(null);
      setBuildPhase("");
      onLoading(false);
    }
  };

  const retryBuild = async () => {
    // Reset only failed builds, keep successful ones
    const newBuildStatus = { ...buildStatus };

    if (buildStatus.api.status === "failed") {
      newBuildStatus.api = {
        status: "pending",
        logs: [],
        startTime: null,
        endTime: null,
        progress: 0,
        currentStep: "",
      };
    }

    if (buildStatus.front.status === "failed") {
      newBuildStatus.front = {
        status: "pending",
        logs: [],
        startTime: null,
        endTime: null,
        progress: 0,
        currentStep: "",
      };
    }

    setBuildStatus(newBuildStatus);
    await startBuild();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "failed":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "building":
        return <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />;
      default:
        return <div className="w-5 h-5 rounded-full bg-gray-300" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "success":
        return <Badge className="bg-green-500">✓ Success</Badge>;
      case "failed":
        return <Badge variant="destructive">✗ Failed</Badge>;
      case "building":
        return <Badge className="bg-blue-500">Building...</Badge>;
      default:
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const formatDuration = (start: Date, end: Date) => {
    const duration = Math.round((end.getTime() - start.getTime()) / 1000);
    return `${duration}s`;
  };

  const canProceed =
    buildStatus.api.status === "success" &&
    buildStatus.front.status === "success";
  const hasFailed =
    buildStatus.api.status === "failed" ||
    buildStatus.front.status === "failed";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Build className="w-6 h-6" />
          Build Applications
        </CardTitle>
        <CardDescription>
          Build both API and Frontend applications using{" "}
          {packageManager ? packageManager.packageManager : "bun"}.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        {isBuilding && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Overall Progress</span>
              <span className="text-sm text-gray-500">{overallProgress}%</span>
            </div>
            <Progress value={overallProgress} className="h-2" />
            {buildPhase && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Terminal className="w-4 h-4" />
                <span>
                  {buildPhase === "api" && "Building API application..."}
                  {buildPhase === "frontend" &&
                    "Building Frontend application..."}
                  {buildPhase === "complete" && "Finalizing deployment..."}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Build Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(buildStatus.api.status)}
                <span className="font-medium">API Build</span>
              </div>
              {getStatusBadge(buildStatus.api.status)}
            </div>

            {buildStatus.api.status === "building" && (
              <div className="space-y-2 mb-3">
                <Progress value={buildStatus.api.progress} className="h-1" />
                <p className="text-xs text-gray-500">
                  {buildStatus.api.currentStep}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Command:{" "}
              <code>
                {packageManager ? packageManager.packageManager : "bun"} run
                build
              </code>
            </p>
            {buildStatus.api.startTime && buildStatus.api.endTime && (
              <p className="text-xs text-gray-400 mt-1">
                Duration:{" "}
                {formatDuration(
                  buildStatus.api.startTime,
                  buildStatus.api.endTime
                )}
              </p>
            )}
          </div>

          <div className="p-4 border rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                {getStatusIcon(buildStatus.front.status)}
                <span className="font-medium">Frontend Build</span>
              </div>
              {getStatusBadge(buildStatus.front.status)}
            </div>

            {buildStatus.front.status === "building" && (
              <div className="space-y-2 mb-3">
                <Progress value={buildStatus.front.progress} className="h-1" />
                <p className="text-xs text-gray-500">
                  {buildStatus.front.currentStep}
                </p>
              </div>
            )}

            <p className="text-sm text-gray-500">
              Command:{" "}
              <code>
                {packageManager ? packageManager.packageManager : "bun"} run
                build
              </code>
            </p>
            {buildStatus.front.startTime && buildStatus.front.endTime && (
              <p className="text-xs text-gray-400 mt-1">
                Duration:{" "}
                {formatDuration(
                  buildStatus.front.startTime,
                  buildStatus.front.endTime
                )}
              </p>
            )}
          </div>
        </div>

        {/* Build Logs */}
        {(buildStatus.api.logs.length > 0 ||
          buildStatus.front.logs.length > 0) && (
          <div className="space-y-4">
            <h4 className="font-medium flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              Build Logs
            </h4>

            {buildStatus.api.logs.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  API Build Logs
                  {buildStatus.api.status === "building" && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                </h5>
                <ScrollArea className="h-32 w-full border rounded p-3 bg-gray-50">
                  <div className="space-y-1">
                    {buildStatus.api.logs.map((log, index) => (
                      <div key={index} className="text-xs font-mono">
                        <span className="text-gray-400">[{log.timestamp}]</span>
                        <span
                          className={log.isError ? "text-red-600 ml-2" : "ml-2"}
                        >
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}

            {buildStatus.front.logs.length > 0 && (
              <div>
                <h5 className="text-sm font-medium mb-2 flex items-center gap-2">
                  Frontend Build Logs
                  {buildStatus.front.status === "building" && (
                    <Loader2 className="w-3 h-3 animate-spin" />
                  )}
                </h5>
                <ScrollArea className="h-32 w-full border rounded p-3 bg-gray-50">
                  <div className="space-y-1">
                    {buildStatus.front.logs.map((log, index) => (
                      <div key={index} className="text-xs font-mono">
                        <span className="text-gray-400">[{log.timestamp}]</span>
                        <span
                          className={log.isError ? "text-red-600 ml-2" : "ml-2"}
                        >
                          {log.message}
                        </span>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        )}

        {/* Status Messages */}
        {!isBuilding &&
          buildStatus.api.status === "pending" &&
          buildStatus.front.status === "pending" && (
            <Alert>
              <Build className="h-4 w-4" />
              <AlertDescription>
                Ready to build both applications. This process may take a few
                minutes and you'll see real-time progress.
              </AlertDescription>
            </Alert>
          )}

        {hasFailed && !isBuilding && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              One or more builds failed. You can retry the failed builds without
              losing your progress.
            </AlertDescription>
          </Alert>
        )}

        {canProceed && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Both applications built successfully! Ready to setup admin
              account.
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack} disabled={isBuilding}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          {!canProceed &&
            buildStatus.api.status === "pending" &&
            buildStatus.front.status === "pending" && (
              <Button
                onClick={startBuild}
                disabled={isBuilding}
                className="flex-1"
              >
                {isBuilding ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Building Applications...
                  </>
                ) : (
                  <>
                    <Build className="w-4 h-4 mr-2" />
                    Start Build Process
                  </>
                )}
              </Button>
            )}

          {hasFailed && !isBuilding && (
            <Button
              onClick={retryBuild}
              disabled={isBuilding}
              className="flex-1"
              variant="outline"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry Failed Builds
            </Button>
          )}

          {canProceed && (
            <Button
              onClick={() =>
                onComplete({
                  buildResults: buildStatus,
                  deploymentUrls: {
                    api: "http://localhost:3001",
                    front: "http://localhost:3000",
                  },
                })
              }
              className="flex-1"
            >
              Continue to Admin Setup
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

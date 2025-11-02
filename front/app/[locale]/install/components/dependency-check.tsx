"use client";

import { useState, useEffect } from "react";
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
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";

interface DependencyCheckProps {
  onComplete: (data: any) => void;
  onLoading: (loading: boolean) => void;
}

export default function DependencyCheck({
  onComplete,
  onLoading,
}: DependencyCheckProps) {
  const [dependencies, setDependencies] = useState({
    node: { version: null, required: "23.0.0", status: "checking" },
    npm: { version: null, required: "10.0.0", status: "checking" },
    pnpm: { version: null, required: "9.1.2", status: "checking" },
    bun: { version: null, required: "1.2.5", status: "checking" },
  });
  const [isChecking, setIsChecking] = useState(true);

  const checkDependencies = async () => {
    setIsChecking(true);
    onLoading(true);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/install/check-dependencies"
      );
      const data = await response.json();
      setDependencies(data.dependencies);
    } catch (error) {
      console.error("Failed to check dependencies:", error);
    } finally {
      setIsChecking(false);
      onLoading(false);
    }
  };

  useEffect(() => {
    checkDependencies();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "satisfied":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "unsatisfied":
        return <XCircle className="w-5 h-5 text-red-500" />;
      case "not-found":
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <RefreshCw className="w-5 h-5 text-gray-400 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "satisfied":
        return (
          <Badge variant="default" className="bg-green-500">
            ✓ OK
          </Badge>
        );
      case "unsatisfied":
        return <Badge variant="destructive">✗ Update Required</Badge>;
      case "not-found":
        return <Badge variant="secondary">Not Found</Badge>;
      default:
        return <Badge variant="outline">Checking...</Badge>;
    }
  };

  const canProceed =
    dependencies.node.status === "satisfied" &&
    (dependencies.npm.status === "satisfied" ||
      dependencies.pnpm.status === "satisfied" ||
      dependencies.bun.status === "satisfied");

  const handleContinue = () => {
    onComplete(dependencies);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <CheckCircle className="w-6 h-6" />
          System Dependencies Check
        </CardTitle>
        <CardDescription>
          Verifying that your system meets the minimum requirements
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Node.js Check */}
        <div className="flex items-center justify-between p-4 border rounded-lg">
          <div className="flex items-center gap-3">
            {getStatusIcon(dependencies.node.status)}
            <div>
              <h3 className="font-medium">Node.js</h3>
              <p className="text-sm text-gray-500">
                Required: v{dependencies.node.required}+
                {dependencies.node.version &&
                  ` | Found: v${dependencies.node.version}`}
              </p>
            </div>
          </div>
          {getStatusBadge(dependencies.node.status)}
        </div>

        {/* Package Managers */}
        <div className="space-y-3">
          <h3 className="font-medium text-gray-900">
            Package Managers (at least one required)
          </h3>

          {["npm", "pnpm", "bun"].map((pm) => (
            <div
              key={pm}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div className="flex items-center gap-3">
                {getStatusIcon(dependencies[pm].status)}
                <div>
                  <h4 className="font-medium capitalize">{pm}</h4>
                  <p className="text-sm text-gray-500">
                    Required: v{dependencies[pm].required}+
                    {dependencies[pm].version &&
                      ` | Found: v${dependencies[pm].version}`}
                  </p>
                </div>
              </div>
              {getStatusBadge(dependencies[pm].status)}
            </div>
          ))}
        </div>

        {/* Status Messages */}
        {!isChecking && (
          <>
            {canProceed ? (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  All requirements satisfied! You can proceed with the
                  installation.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertDescription>
                  Please install or update the required dependencies before
                  continuing.
                  {dependencies.node.status !== "satisfied" && (
                    <div className="mt-2">
                      • Node.js v{dependencies.node.required}+ is required
                    </div>
                  )}
                  {!["npm", "pnpm", "bun"].some(
                    (pm) => dependencies[pm].status === "satisfied"
                  ) && (
                    <div className="mt-2">
                      • At least one package manager (npm, pnpm, or bun) is
                      required
                    </div>
                  )}
                </AlertDescription>
              </Alert>
            )}
          </>
        )}

        {/* Actions */}
        <div className="flex justify-between w-full">
          <Button
            variant="outline"
            onClick={checkDependencies}
            disabled={isChecking}
            className="flex items-center justify-center flex-1"
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isChecking ? "animate-spin" : ""}`}
            />
            Recheck
          </Button>

          <Button
            onClick={handleContinue}
            disabled={!canProceed || isChecking}
            className="flex-1"
          >
            Continue to Environment configuration
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

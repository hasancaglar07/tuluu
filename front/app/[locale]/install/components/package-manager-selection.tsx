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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Package, ArrowLeft } from "lucide-react";

interface PackageManagerSelectionProps {
  dependencies: any;
  onComplete: (data: any) => void;
  onBack: () => void;
  onLoading: (loading: boolean) => void;
}

export default function PackageManagerSelection({
  dependencies,
  onComplete,
  onBack,
  onLoading,
}: PackageManagerSelectionProps) {
  const [selectedManager, setSelectedManager] = useState("");
  const [isInstalling, setIsInstalling] = useState(false);

  const availableManagers = ["npm", "pnpm", "bun"].filter(
    (pm) => dependencies[pm].status === "satisfied"
  );

  const getManagerInfo = (manager: string) => {
    const info = {
      npm: {
        name: "npm",
        description:
          "Node Package Manager - The default package manager for Node.js",
        version: dependencies.npm.version,
        installCmd: "npm install",
        buildCmd: "npm run build",
      },
      pnpm: {
        name: "pnpm",
        description: "Fast, disk space efficient package manager",
        version: dependencies.pnpm.version,
        installCmd: "pnpm install",
        buildCmd: "pnpm run build",
      },
      bun: {
        name: "Bun",
        description: "Fast all-in-one JavaScript runtime & toolkit",
        version: dependencies.bun.version,
        installCmd: "bun install",
        buildCmd: "bun run build",
      },
    };
    return info[manager];
  };

  const handleInstallDependencies = async () => {
    if (!selectedManager) return;

    setIsInstalling(true);
    onLoading(true);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/install/install-dependencies",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packageManager: selectedManager }),
        }
      );

      const data = await response.json();

      if (data.success) {
        onComplete({
          packageManager: selectedManager,
          installationResults: data.results,
        });
      } else {
        throw new Error(data.error || "Installation failed");
      }
    } catch (error) {
      console.error("Installation failed:", error);
      alert("Installation failed. Please check the console for details.");
    } finally {
      setIsInstalling(false);
      onLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="w-6 h-6" />
          Select Package Manager
        </CardTitle>
        <CardDescription>
          Choose your preferred package manager to install dependencies
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <RadioGroup value={selectedManager} onValueChange={setSelectedManager}>
          {availableManagers.map((manager) => {
            const info = getManagerInfo(manager);
            return (
              <div
                key={manager}
                className="flex items-center space-x-2 p-4 border rounded-lg hover:bg-gray-50"
              >
                <RadioGroupItem value={manager} id={manager} />
                <Label htmlFor={manager} className="flex-1 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{info.name}</span>
                        <Badge variant="outline">v{info.version}</Badge>
                      </div>
                      <p className="text-sm text-gray-500 mt-1">
                        {info.description}
                      </p>
                      <div className="text-xs text-gray-400 mt-2">
                        Install:{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          {info.installCmd}
                        </code>
                        {" • "}
                        Build:{" "}
                        <code className="bg-gray-100 px-1 rounded">
                          {info.buildCmd}
                        </code>
                      </div>
                    </div>
                  </div>
                </Label>
              </div>
            );
          })}
        </RadioGroup>

        {selectedManager && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">
              Installation Plan
            </h4>
            <div className="text-sm text-blue-800 space-y-1">
              <div>
                • Install dependencies for <code>api/</code> folder
              </div>
              <div>
                • Install dependencies for <code>front/</code> folder
              </div>
              <div>
                • Using {getManagerInfo(selectedManager).name} v
                {getManagerInfo(selectedManager).version}
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-3">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleInstallDependencies}
            disabled={!selectedManager || isInstalling}
            className="flex-1"
          >
            {isInstalling
              ? "Installing Dependencies..."
              : "Install Dependencies & Continue"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

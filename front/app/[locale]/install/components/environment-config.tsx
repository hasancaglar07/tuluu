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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Settings, ArrowLeft, Eye, EyeOff, Info } from "lucide-react";

interface EnvironmentConfigProps {
  packageManager: any;
  onComplete: (data: any) => void;
  onBack: () => void;
  onLoading: (loading: boolean) => void;
}

export default function EnvironmentConfig({
  packageManager,
  onComplete,
  onBack,
  onLoading,
}: EnvironmentConfigProps) {
  const [envVars, setEnvVars] = useState({
    api: {},
    front: {},
  });
  const [envTemplates, setEnvTemplates] = useState({
    api: [],
    front: [],
  });
  const [showPasswords, setShowPasswords] = useState({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadEnvTemplates();
  }, []);

  const loadEnvTemplates = async () => {
    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/install/get-env-templates"
      );
      const data = await response.json();

      setEnvTemplates(data.templates);

      // Initialize with existing values from .env files or empty values
      const initialApiVars = {};
      const initialFrontVars = {};

      data.templates.api.forEach((envVar) => {
        // Use existing value if available, otherwise empty string
        initialApiVars[envVar.key] =
          data.existingValues?.api?.[envVar.key] || "";
      });

      data.templates.front.forEach((envVar) => {
        // Use existing value if available, otherwise empty string
        initialFrontVars[envVar.key] =
          data.existingValues?.front?.[envVar.key] || "";
      });

      setEnvVars({
        api: initialApiVars,
        front: initialFrontVars,
      });
    } catch (error) {
      console.error("Failed to load env templates:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEnvChange = (
    app: "api" | "front",
    key: string,
    value: string
  ) => {
    setEnvVars((prev) => ({
      ...prev,
      [app]: {
        ...prev[app],
        [key]: value,
      },
    }));
  };

  const togglePasswordVisibility = (key: string) => {
    setShowPasswords((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const isFormValid = () => {
    const apiRequired = envTemplates.api.filter((env) => env.required);
    const frontRequired = envTemplates.front.filter((env) => env.required);

    const apiValid = apiRequired.every((env) => envVars.api[env.key]?.trim());
    const frontValid = frontRequired.every((env) =>
      envVars.front[env.key]?.trim()
    );

    return apiValid && frontValid;
  };

  const handleSaveEnvironment = async () => {
    onLoading(true);

    try {
      const response = await fetch(
        process.env.NEXT_PUBLIC_API_URL + "/api/install/save-environment",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ envVars }),
        }
      );

      const data = await response.json();

      if (data.success) {
        onComplete({
          envVars,
          savedFiles: data.savedFiles,
        });
      } else {
        throw new Error(data.error || "Failed to save environment variables");
      }
    } catch (error) {
      console.error("Failed to save environment:", error);
      alert(
        "Failed to save environment variables. Please check the console for details."
      );
    } finally {
      onLoading(false);
    }
  };

  const renderEnvForm = (app: "api" | "front") => {
    const template = envTemplates[app];

    return (
      <div className="space-y-4">
        {template.map((envVar) => {
          const isPassword =
            envVar.key.toLowerCase().includes("password") ||
            envVar.key.toLowerCase().includes("secret") ||
            envVar.key.toLowerCase().includes("key");
          const showPassword = showPasswords[`${app}-${envVar.key}`];

          return (
            <div key={envVar.key} className="space-y-2">
              <div className="flex items-center gap-2">
                <Label htmlFor={`${app}-${envVar.key}`} className="font-medium">
                  {envVar.key}
                </Label>
                {envVar.required && (
                  <Badge variant="destructive" className="text-xs">
                    Required
                  </Badge>
                )}
              </div>

              {envVar.description && (
                <p className="text-sm text-gray-500">{envVar.description}</p>
              )}

              <div className="relative">
                <Input
                  id={`${app}-${envVar.key}`}
                  type={isPassword && !showPassword ? "password" : "text"}
                  value={envVars[app][envVar.key] || ""}
                  onChange={(e) =>
                    handleEnvChange(app, envVar.key, e.target.value)
                  }
                  placeholder={envVar.placeholder || `Enter ${envVar.key}`}
                  className={
                    envVar.required && !envVars[app][envVar.key]
                      ? "border-red-300"
                      : ""
                  }
                />

                {isPassword && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-1/2 -translate-y-1/2 h-auto p-1"
                    onClick={() =>
                      togglePasswordVisibility(`${app}-${envVar.key}`)
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </Button>
                )}
              </div>

              {envVar.example && (
                <p className="text-xs text-gray-400">
                  Example:{" "}
                  <code className="bg-gray-100 px-1 rounded">
                    {envVar.example}
                  </code>
                </p>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p>Loading environment templates...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-6 h-6" />
          Environment Configuration
        </CardTitle>
        <CardDescription>
          Configure environment variables for both API and Frontend applications
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            These environment variables will be saved to <code>.env</code> files
            in your api/ and front/ directories. Make sure to keep sensitive
            information secure.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="api" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api" className="flex items-center gap-2">
              API Environment
              <Badge variant="outline">{envTemplates.api.length} vars</Badge>
            </TabsTrigger>
            <TabsTrigger value="front" className="flex items-center gap-2">
              Frontend Environment
              <Badge variant="outline">{envTemplates.front.length} vars</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="api" className="space-y-4 mt-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">API Configuration</h4>
              <p className="text-sm text-gray-600">
                These variables will be saved to <code>api/.env</code>
              </p>
            </div>
            {renderEnvForm("api")}
          </TabsContent>

          <TabsContent value="front" className="space-y-4 mt-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Frontend Configuration</h4>
              <p className="text-sm text-gray-600">
                These variables will be saved to <code>front/.env</code>
              </p>
            </div>
            {renderEnvForm("front")}
          </TabsContent>
        </Tabs>

        <div className="flex justify-between w-full">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>

          <Button
            onClick={handleSaveEnvironment}
            disabled={!isFormValid()}
            className="flex-1"
          >
            Save Environment & Continue
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

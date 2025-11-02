"use client";

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
import {
  CheckCircle,
  Globe,
  ArrowLeft,
  ExternalLink,
  Copy,
  Shield,
  User,
} from "lucide-react";
import { useState } from "react";

interface InstallationCompleteProps {
  buildData: any;
  adminData: any;
  onBack: () => void;
}

export default function InstallationComplete({
  buildData,
  adminData,
  onBack,
}: InstallationCompleteProps) {
  const [copiedUrl, setCopiedUrl] = useState("");

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedUrl(type);
      setTimeout(() => setCopiedUrl(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const deploymentUrls = buildData?.deploymentUrls || {
    api: "http://localhost:3001",
    front: "http://localhost:3000",
  };

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <CardTitle className="text-2xl">Installation Complete!</CardTitle>
        <CardDescription>
          Your monorepo project has been successfully configured with admin
          privileges
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Success Summary */}
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            All installation steps completed successfully. Your applications are
            ready with admin access configured!
          </AlertDescription>
        </Alert>

        {/* Admin Account Summary */}
        {adminData && (
          <div className="p-4 border rounded-lg bg-green-50 border-green-200">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-5 h-5 text-green-600" />
              <h3 className="font-semibold text-green-900">
                Admin Account Created
              </h3>
              <Badge className="bg-green-500">✓ Active</Badge>
            </div>
            <div className="space-y-2 text-sm text-green-800">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="font-medium">Role:</span>
                  <code className="ml-2 bg-green-100 px-2 py-1 rounded">
                    admin
                  </code>
                </div>
                <div>
                  <span className="font-medium">Subscription:</span>
                  <code className="ml-2 bg-green-100 px-2 py-1 rounded">
                    free
                  </code>
                </div>
                <div>
                  <span className="font-medium">Status:</span>
                  <code className="ml-2 bg-green-100 px-2 py-1 rounded">
                    active
                  </code>
                </div>
                <div>
                  <span className="font-medium">Subscription Status:</span>
                  <code className="ml-2 bg-green-100 px-2 py-1 rounded">
                    active
                  </code>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-300">
                <p className="text-xs">
                  ✓ Webhook triggered successfully to update user metadata
                  <br />✓ Admin privileges configured in the database
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Deployment URLs */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Application URLs
          </h3>

          <div className="grid gap-4">
            {/* API URL */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">API</Badge>
                  <span className="font-medium">Backend Application</span>
                </div>
                <Badge className="bg-green-500">✓ Running</Badge>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <code className="flex-1 p-2 bg-white border rounded text-sm">
                  {deploymentUrls.api}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(deploymentUrls.api, "api")}
                >
                  {copiedUrl === "api" ? (
                    "Copied!"
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(deploymentUrls.api, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Frontend URL */}
            <div className="p-4 border rounded-lg bg-gray-50">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Badge variant="outline">Frontend</Badge>
                  <span className="font-medium">Web Application</span>
                </div>
                <Badge className="bg-green-500">✓ Running</Badge>
              </div>

              <div className="flex items-center gap-2 mt-3">
                <code className="flex-1 p-2 bg-white border rounded text-sm">
                  {deploymentUrls.front}
                </code>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(deploymentUrls.front, "front")}
                >
                  {copiedUrl === "front" ? (
                    "Copied!"
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.open(deploymentUrls.front, "_blank")}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="space-y-4">
          <h3 className="font-semibold text-lg">Next Steps</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">1</span>
              </div>
              <div>
                <h4 className="font-medium">Access Your Applications</h4>
                <p className="text-sm text-gray-600">
                  Click the links above to access your API and Frontend
                  applications with admin privileges
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">2</span>
              </div>
              <div>
                <h4 className="font-medium">Admin Dashboard</h4>
                <p className="text-sm text-gray-600 mb-2">
                  You now have admin access to manage users, settings, and
                  system configuration
                </p>
                <Badge variant="outline" className="text-xs">
                  <User className="w-3 h-3 mr-1" />
                  Admin Role Active
                </Badge>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">3</span>
              </div>
              <div>
                <h4 className="font-medium">Development Commands</h4>
                <p className="text-sm text-gray-600 mb-2">
                  Use these commands for development:
                </p>
                <div className="space-y-1 text-xs">
                  <div>
                    <code className="bg-gray-100 px-1 rounded">
                      cd api && npm run dev
                    </code>{" "}
                    - Start API development server
                  </div>
                  <div>
                    <code className="bg-gray-100 px-1 rounded">
                      cd front && npm run dev
                    </code>{" "}
                    - Start Frontend development server
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-3 p-3 border rounded-lg">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-xs font-medium text-blue-600">4</span>
              </div>
              <div>
                <h4 className="font-medium">Environment & Security</h4>
                <p className="text-sm text-gray-600">
                  Your environment variables and admin credentials are securely
                  configured. Remember to keep your Clerk keys and webhook URLs
                  secure.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4 w-full">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Setup
          </Button>

          <Button
            onClick={() =>
              window.open(deploymentUrls.front + "/admin", "_blank")
            }
            className="flex-1"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            Open Admin Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

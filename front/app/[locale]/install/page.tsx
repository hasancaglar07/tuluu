"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  CheckCircle,
  Loader2,
  Settings,
  UserPlus,
  Shield,
  Globe,
} from "lucide-react";
import DependencyCheck from "./components/dependency-check";
import EnvironmentConfig from "./components/environment-config";
import ClerkSetup from "./components/clerk-setup";
import AdminRoleCreation from "./components/admin-role-creation";
import InstallationComplete from "./components/installation-complete";

const STEPS = [
  { id: "dependencies", title: "Check Dependencies", icon: CheckCircle },
  { id: "environment", title: "Configure Environment", icon: Settings },
  { id: "clerk-setup", title: "Create an Account", icon: UserPlus },
  { id: "admin-role", title: "Create Admin Role", icon: Shield },
  { id: "complete", title: "Installation Complete", icon: Globe },
];

export default function InstallWizard() {
  const [currentStep, setCurrentStep] = useState(0);
  const [stepData, setStepData] = useState({
    dependencies: null,
    environment: null,
    clerkSetup: null,
    adminRole: null,
  });
  const [isLoading, setIsLoading] = useState(false);

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const handleStepComplete = (stepId: string, data: any) => {
    setStepData((prev) => ({ ...prev, [stepId]: data }));
    if (currentStep < STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleStepBack = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const renderCurrentStep = () => {
    const step = STEPS[currentStep];

    switch (step.id) {
      case "dependencies":
        return (
          <DependencyCheck
            onComplete={(data) => handleStepComplete("dependencies", data)}
            onLoading={setIsLoading}
          />
        );
      case "environment":
        return (
          <EnvironmentConfig
            dependencies={stepData.dependencies}
            onComplete={(data) => handleStepComplete("environment", data)}
            onBack={handleStepBack}
            onLoading={setIsLoading}
          />
        );
      case "clerk-setup":
        return (
          <ClerkSetup
            environmentData={stepData.environment}
            onComplete={(data) => handleStepComplete("clerk-setup", data)}
            onBack={handleStepBack}
            onLoading={setIsLoading}
          />
        );
      case "admin-role":
        return (
          <AdminRoleCreation
            clerkData={stepData.clerkSetup}
            onComplete={(data) => handleStepComplete("admin-role", data)}
            onBack={handleStepBack}
            onLoading={setIsLoading}
          />
        );
      case "complete":
        return (
          <InstallationComplete
            buildData={stepData.environment}
            adminData={stepData.adminRole}
            onBack={handleStepBack}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Project Installation Wizard
          </h1>
          <p className="text-gray-600">
            Configure your monorepo project in a few simple steps
          </p>
        </div>

        {/* Progress Bar */}
        <Card className="mb-8">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStep + 1} of {STEPS.length}
              </span>
              <span className="text-sm text-gray-500">
                {Math.round(progress)}% Complete
              </span>
            </div>
            <Progress value={progress} className="mb-4" />

            {/* Step Indicators */}
            <div className="flex justify-between">
              {STEPS.map((step, index) => {
                const Icon = step.icon;
                const isActive = index === currentStep;
                const isCompleted = index < currentStep;

                return (
                  <div key={step.id} className="flex flex-col items-center">
                    <div
                      className={`
                      w-10 h-10 rounded-full flex items-center justify-center mb-2
                      ${
                        isCompleted
                          ? "bg-green-500 text-white"
                          : isActive
                          ? "bg-blue-500 text-white"
                          : "bg-gray-200 text-gray-400"
                      }
                    `}
                    >
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <Icon className="w-5 h-5" />
                      )}
                    </div>
                    <span
                      className={`text-xs text-center max-w-20 ${
                        isActive ? "text-blue-600 font-medium" : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Current Step Content */}
        <div className="relative">
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex items-center justify-center rounded-lg">
              <div className="flex items-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing...</span>
              </div>
            </div>
          )}
          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
}

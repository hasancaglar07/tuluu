import { CheckCircle } from "lucide-react";
import type { PaymentStep } from "@/types";
import { FormattedMessage } from "react-intl";

// Step wizard component that shows progress through payment flow
// Each step has a number/checkmark and connecting lines
interface StepWizardProps {
  currentStep: PaymentStep;
}

export function StepWizard({ currentStep }: StepWizardProps) {
  // Helper function to determine if a step is completed
  const isStepCompleted = (step: PaymentStep) => {
    const steps = ["method", "details", "review", "success"];
    const currentIndex = steps.indexOf(currentStep);
    const stepIndex = steps.indexOf(step);
    return stepIndex < currentIndex;
  };

  // Helper function to determine if a step is currently active
  const isStepActive = (step: PaymentStep) => {
    return currentStep === step;
  };

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {/* Step 1: Payment Method */}
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isStepCompleted("method") || isStepActive("method")
                ? "bg-primary-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {isStepCompleted("method") ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              "1"
            )}
          </div>
          <span className="text-xs mt-1">
            <FormattedMessage id="step.method" defaultMessage="Méthode" />
          </span>
        </div>

        {/* Connection line between steps 1 and 2 */}
        <div
          className={`flex-1 h-1 mx-2 ${
            isStepCompleted("details") ||
            currentStep === "details" ||
            currentStep === "review" ||
            currentStep === "success"
              ? "bg-primary-500"
              : "bg-gray-200"
          }`}
        />

        {/* Step 2: Payment Details */}
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isStepCompleted("details") || isStepActive("details")
                ? "bg-primary-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {isStepCompleted("details") ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              "2"
            )}
          </div>
          <span className="text-xs mt-1">
            <FormattedMessage id="step.details" defaultMessage="Détails" />
          </span>
        </div>

        {/* Connection line between steps 2 and 3 */}
        <div
          className={`flex-1 h-1 mx-2 ${
            isStepCompleted("review") ||
            currentStep === "review" ||
            currentStep === "success"
              ? "bg-primary-500"
              : "bg-gray-200"
          }`}
        />

        {/* Step 3: Review Order */}
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              isStepCompleted("review") || isStepActive("review")
                ? "bg-primary-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {isStepCompleted("review") ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              "3"
            )}
          </div>
          <span className="text-xs mt-1">
            <FormattedMessage id="step.review" defaultMessage="Vérification" />
          </span>
        </div>

        {/* Connection line between steps 3 and 4 */}
        <div
          className={`flex-1 h-1 mx-2 ${
            currentStep === "success" ? "bg-primary-500" : "bg-gray-200"
          }`}
        />

        {/* Step 4: Success */}
        <div className="flex flex-col items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              currentStep === "success"
                ? "bg-primary-500 text-white"
                : "bg-gray-200 text-gray-500"
            }`}
          >
            {currentStep === "success" ? (
              <CheckCircle className="h-5 w-5" />
            ) : (
              "4"
            )}
          </div>
          <span className="text-xs mt-1">
            <FormattedMessage
              id="step.confirmation"
              defaultMessage="Confirmation"
            />
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth, useUser } from "@clerk/nextjs";
import axios from "axios";
import { apiClient } from "@/lib/api-client";
import { FormattedMessage } from "react-intl";

// Import our custom components
import { LoadingSpinner } from "./components/loading-spinner";
import { ErrorDisplay } from "./components/error-display";
import { OrderSummary } from "./components/order-summary";
import { PaymentMethodSelection } from "./components/payment-method-selection";
import { PaymentDetailsForm } from "./components/payment-details-form";
import { OrderReview } from "./components/order-review";
import { SuccessMessage } from "./components/success-message";

// Import types
import type {
  SubscriptionPlan,
  PaymentProvider,
  PaymentStep,
  CardDetails,
} from "@/types";
import { StepWizard } from "./components/step-wzard";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";

/**
 * Main subscription detail component that handles the entire payment flow
 * This component orchestrates all the smaller components and manages the state
 */
export default function SubscriptionDetail() {
  // Next.js hooks for navigation and URL parameters
  const router = useLocalizedRouter();
  const params = useParams();

  // Clerk authentication hooks
  const { getToken } = useAuth();
  const { user, isLoaded } = useUser();

  // Main state variables
  const [plan, setPlan] = useState<SubscriptionPlan | null>(null);
  const [providers, setProviders] = useState<PaymentProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Payment flow state
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<PaymentStep>("method");
  const [isProcessing, setIsProcessing] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Credit card form state with default demo values
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: "4242424242424242",
    cardEmail: user?.primaryEmailAddress?.emailAddress,
    cardName: "",
    expiry: "10/26",
    cvc: "458",
  });

  // Get plan ID from URL parameters
  const planId = params.id as string;

  /**
   * Effect to fetch subscription plan and payment providers data
   * Runs when component mounts or when planId/user changes
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get authentication token
        const token = await getToken();
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        // Fetch subscription plan details
        const planRes = await apiClient.get(
          `/api/subscriptions/plans/${planId}`,
          { headers }
        );
        const planData = planRes.data;

        if (!planData.success) {
          throw new Error(planData.message || "Failed to fetch plan");
        }

        // Fetch available payment providers
        const providersRes = await axios.get(
          process.env.NEXT_PUBLIC_API_URL + "/api/payments/providers",
          { headers }
        );
        const providersData = providersRes.data;

        // Update state with fetched data
        setPlan(planData.data);
        setProviders(providersData.data.providers);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    };

    // Only fetch if we have a plan ID
    if (planId) {
      fetchData();
    }

    // Update card details with user information when available
    if (user?.primaryEmailAddress?.emailAddress) {
      const fullName = `${user.firstName || ""} ${user.lastName || ""}`.trim();
      setCardDetails((prev) => ({
        ...prev,
        cardEmail: user.primaryEmailAddress?.emailAddress,
        cardName: fullName || "John Doe",
      }));
    }
  }, [planId, user, getToken]);

  /**
   * Handle payment method selection
   * Updates the selected provider state
   */
  const handleSelectPaymentMethod = (providerId: string) => {
    setSelectedProvider(providerId);
  };

  /**
   * Handle continue button click
   * Advances to next step or processes payment
   */
  const handleContinue = async () => {
    if (currentStep === "method" && selectedProvider) {
      setCurrentStep("details");
    } else if (currentStep === "details") {
      setCurrentStep("review");
    } else if (currentStep === "review") {
      await processPayment();
    } else if (currentStep === "success") {
      router.push("/");
    }
  };

  /**
   * Handle back button click
   * Goes to previous step or navigates back
   */
  const handleBack = () => {
    if (currentStep === "details") {
      setCurrentStep("method");
    } else if (currentStep === "review") {
      setCurrentStep("details");
    } else {
      router.back();
    }
  };

  /**
   * Process the payment
   * Calls the payment API and handles different provider types
   */
  const processPayment = async () => {
    if (!plan || !selectedProvider) return;

    setIsProcessing(true);

    try {
      const token = await getToken();

      // Call payment API
      const response = await axios.post(
        process.env.NEXT_PUBLIC_API_URL + "/api/payments/checkout",
        {
          termsAccepted: termsAccepted,
          planId: plan.id,
          provider: selectedProvider,
          successUrl: `${window.location.origin}/payment/success`,
          cancelUrl: `${window.location.origin}/subscriptions/${plan.id}`,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = response.data;

      if (!data.success) {
        throw new Error(data.message || "Failed to create checkout session");
      }

      const provider = providers.find((p) => p.id === selectedProvider);

      // Handle different provider types
      if (provider?.type === "redirect") {
        // Redirect to external payment page (PayPal, etc.)
        window.location.href = data.data.checkout.checkoutUrl;
      } else if (provider?.type === "card") {
        // Simulate card processing delay
        setTimeout(() => {
          setIsProcessing(false);
          setCurrentStep("success");
        }, 2000);
      } else {
        // Default success flow
        setIsProcessing(false);
        setCurrentStep("success");
      }
    } catch (err) {
      setIsProcessing(false);
      setError(err instanceof Error ? err.message : "Payment failed");
    }
  };

  /**
   * Check if continue button should be disabled
   * Based on current step and required fields
   */
  const isContinueDisabled = () => {
    if (isProcessing) return true;

    switch (currentStep) {
      case "method":
        return !selectedProvider;
      case "details":
        if (selectedProvider === "stripe") {
          return (
            !cardDetails.cardName ||
            !cardDetails.cardNumber ||
            !cardDetails.expiry ||
            !cardDetails.cvc
          );
        }
        return false;
      case "review":
        return !termsAccepted;
      default:
        return false;
    }
  };

  /**
   * Get continue button text based on current step
   */
  const getContinueButtonText = () => {
    if (isProcessing) {
      return (
        <div className="flex items-center gap-2">
          <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>
            <FormattedMessage
              id="payment.processing"
              defaultMessage="Traitement..."
            />
          </span>
        </div>
      );
    }

    switch (currentStep) {
      case "review":
        return (
          <FormattedMessage
            id="payment.confirmAndPay"
            defaultMessage="Confirmer et payer"
          />
        );
      case "success":
        return (
          <FormattedMessage
            id="payment.backToHome"
            defaultMessage="Retour à l'accueil"
          />
        );
      default:
        return (
          <FormattedMessage id="payment.continue" defaultMessage="Continuer" />
        );
    }
  };

  // Show loading spinner while data is being fetched
  if (loading || !isLoaded) {
    return (
      <LoadingSpinner message="Chargement des informations de paiement..." />
    );
  }

  // Show error message if something went wrong
  if (error || !plan) {
    return (
      <ErrorDisplay
        error={error || "Plan d'abonnement introuvable"}
        onGoBack={() => router.push("/subscriptions")}
      />
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header with back button and title */}
      <div className="p-4 flex items-center justify-between border-b border-gray-200 bg-primary-500 text-white">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleBack}
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold">
            <FormattedMessage id="payment.title" defaultMessage="Paiement" />
          </h1>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        {/* Step progress indicator */}
        <StepWizard currentStep={currentStep} />

        {/* Order summary - shown on all steps */}
        <OrderSummary plan={plan} />

        {/* Step-specific content */}
        {currentStep === "method" && (
          <PaymentMethodSelection
            providers={providers}
            selectedProvider={selectedProvider}
            onSelectProvider={handleSelectPaymentMethod}
          />
        )}

        {currentStep === "details" && (
          <PaymentDetailsForm
            selectedProvider={selectedProvider}
            providers={providers}
            cardDetails={cardDetails}
            onCardDetailsChange={setCardDetails}
          />
        )}

        {currentStep === "review" && (
          <OrderReview
            plan={plan}
            selectedProvider={selectedProvider}
            cardDetails={cardDetails}
            termsAccepted={termsAccepted}
            onTermsChange={setTermsAccepted}
          />
        )}

        {currentStep === "success" && (
          <SuccessMessage
            plan={plan}
            selectedProvider={selectedProvider}
            providers={providers}
          />
        )}

        {/* Error display for current step */}
        {error && currentStep !== "success" && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === "success" || isProcessing}
          >
            {currentStep === "method" ? (
              <FormattedMessage id="payment.cancel" defaultMessage="Annuler" />
            ) : (
              <FormattedMessage id="payment.back" defaultMessage="Retour" />
            )}
          </Button>

          <Button
            onClick={handleContinue}
            disabled={isContinueDisabled()}
            className="bg-primary-500 hover:bg-primary-700 min-w-[120px]"
          >
            {getContinueButtonText()}
          </Button>
        </div>
      </div>
    </div>
  );
}

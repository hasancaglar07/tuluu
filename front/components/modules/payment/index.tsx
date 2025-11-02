"use client";

import { useState } from "react";
import { m } from "framer-motion";
import { ArrowLeft, CreditCard, CheckCircle, Star, Crown } from "lucide-react";

import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useDispatch } from "react-redux";
import { addXp } from "@/store/userSlice";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { useSearchParams } from "next/navigation";
import { FormattedMessage } from "react-intl";

// Payment types
type PaymentType = "premium" | "xp";
type PaymentMethod = "paypal" | "stripe" | null;
type PaymentStep = "method" | "details" | "review" | "success";

export default function Payment() {
  const router = useLocalizedRouter();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();

  // Get payment type and amount from URL params
  const paymentType = (searchParams.get("type") as PaymentType) || "premium";
  const xpAmount = parseInt(searchParams.get("xpAmount") || "0", 10);

  // Calculate payment amount
  const isPremium = paymentType === "premium";
  const premiumPrice = 4.99;
  const xpPrice = xpAmount / 100; // 100 XP = $1
  const amount = isPremium ? premiumPrice : xpPrice;

  // Payment state
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [currentStep, setCurrentStep] = useState<PaymentStep>("method");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvc: "",
  });

  // Handle payment method selection
  const handleSelectPaymentMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  // Handle continue to next step
  const handleContinue = () => {
    if (currentStep === "method" && paymentMethod) {
      setCurrentStep("details");
    } else if (currentStep === "details") {
      setCurrentStep("review");
    } else if (currentStep === "review") {
      processPayment();
    } else if (currentStep === "success") {
      router.push("/payment/success");
    }
  };

  // Handle back button
  const handleBack = () => {
    if (currentStep === "details") {
      setCurrentStep("method");
    } else if (currentStep === "review") {
      setCurrentStep("details");
    } else {
      router.back();
    }
  };

  // Process payment (simulated)
  const processPayment = () => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setCurrentStep("success");

      // Update user state based on payment type
      if (isPremium) {
        // dispatch(upgradeSubscription());
      } else {
        dispatch(addXp(xpAmount));
      }
    }, 2000);
  };

  // Format card number with spaces
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");
    const matches = v.match(/\d{4,16}/g);
    const match = (matches && matches[0]) || "";
    const parts = [];

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }

    if (parts.length) {
      return parts.join(" ");
    } else {
      return value;
    }
  };

  // Format expiry date
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, "").replace(/[^0-9]/gi, "");

    if (v.length > 2) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`;
    }

    return v;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
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
          <h1 className="text-xl font-bold">Paiement</h1>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        {/* Step wizard */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === "method"
                    ? "bg-primary-500 text-white"
                    : "bg-primary-500 text-white"
                }`}
              >
                {currentStep === "method" ? (
                  "1"
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs mt-1">Méthode</span>
            </div>

            <div
              className={`flex-1 h-1 mx-2 ${
                currentStep === "method" ? "bg-gray-200" : "bg-primary-500"
              }`}
            />

            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === "details"
                    ? "bg-primary-500 text-white"
                    : currentStep === "method"
                    ? "bg-gray-200 text-gray-500"
                    : "bg-primary-500 text-white"
                }`}
              >
                {currentStep === "details" ? (
                  "2"
                ) : currentStep === "method" ? (
                  "2"
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
              </div>
              <span className="text-xs mt-1">Détails</span>
            </div>

            <div
              className={`flex-1 h-1 mx-2 ${
                currentStep === "method" || currentStep === "details"
                  ? "bg-gray-200"
                  : "bg-primary-500"
              }`}
            />

            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  currentStep === "review"
                    ? "bg-primary-500 text-white"
                    : currentStep === "success"
                    ? "bg-primary-500 text-white"
                    : "bg-gray-200 text-gray-500"
                }`}
              >
                {currentStep === "review" ? (
                  "3"
                ) : currentStep === "success" ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  "3"
                )}
              </div>
              <span className="text-xs mt-1">Vérification</span>
            </div>

            <div
              className={`flex-1 h-1 mx-2 ${
                currentStep === "success" ? "bg-primary-500" : "bg-gray-200"
              }`}
            />

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
              <span className="text-xs mt-1">Confirmation</span>
            </div>
          </div>
        </div>

        {/* Order summary */}
        <div className="mb-8 p-6 border border-gray-200 rounded-xl bg-gray-50">
          <h2 className="font-bold text-xl mb-4">Résumé de la commande</h2>

          <div className="flex items-center gap-4">
            <div className="p-3 bg-white rounded-lg">
              {isPremium ? (
                <Crown className="h-8 w-8 text-yellow-500" />
              ) : (
                <Star className="h-8 w-8 text-yellow-500" />
              )}
            </div>

            <div className="flex-1">
              <h4 className="font-bold">
                {isPremium ? "Abonnement Premium" : `${xpAmount} XP`}
              </h4>
              <p className="text-gray-600 text-sm">
                {isPremium
                  ? "Accès illimité à tout le contenu premium"
                  : "Points d'expérience pour acheter des cœurs et des boosts"}
              </p>
            </div>

            <div className="text-right">
              <div className="font-bold text-lg">${amount.toFixed(2)}</div>
              {isPremium && (
                <div className="text-xs text-gray-500">par mois</div>
              )}
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between font-bold">
            <span>Total</span>
            <span>${amount.toFixed(2)} USD</span>
          </div>
        </div>

        {/* Payment method selection */}
        {currentStep === "method" && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="font-bold text-xl mb-4">
              <FormattedMessage
                id="paymentMethod.title"
                defaultMessage="Choose your payment method"
              />
            </h2>

            <RadioGroup
              value={paymentMethod || ""}
              onValueChange={(value) =>
                handleSelectPaymentMethod(value as PaymentMethod)
              }
            >
              <div className="space-y-4">
                <div
                  className={`flex items-center p-4 border rounded-lg ${
                    paymentMethod === "paypal"
                      ? "border-[#58cc02] bg-primary-500/5"
                      : "border-gray-200"
                  }`}
                >
                  <RadioGroupItem value="paypal" id="paypal" className="mr-4" />
                  <Label
                    htmlFor="paypal"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="bg-[#0070ba] p-2 rounded">
                      <svg
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M19.5 8.25H4.5C3.67157 8.25 3 8.92157 3 9.75V18.75C3 19.5784 3.67157 20.25 4.5 20.25H19.5C20.3284 20.25 21 19.5784 21 18.75V9.75C21 8.92157 20.3284 8.25 19.5 8.25Z"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M7.5 15.75C7.5 15.75 8.25 15 9.75 15C11.25 15 12.75 16.5 14.25 16.5C15.75 16.5 16.5 15.75 16.5 15.75"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M16.5 8.25V6C16.5 4.34315 15.1569 3 13.5 3H4.5C3.67157 3 3 3.67157 3 4.5V6.75"
                          stroke="white"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <div>
                      <div className="font-bold">PayPal</div>
                      <div className="text-sm text-gray-500">
                        Paiement sécurisé avec votre compte PayPal
                      </div>
                    </div>
                  </Label>
                </div>

                <div
                  className={`flex items-center p-4 border rounded-lg ${
                    paymentMethod === "stripe"
                      ? "border-[#58cc02] bg-primary-500/5"
                      : "border-gray-200"
                  }`}
                >
                  <RadioGroupItem value="stripe" id="stripe" className="mr-4" />
                  <Label
                    htmlFor="stripe"
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <div className="bg-[#635bff] p-2 rounded">
                      <CreditCard className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <div className="font-bold">Carte de crédit</div>
                      <div className="text-sm text-gray-500">
                        Paiement sécurisé par carte via Stripe
                      </div>
                    </div>
                  </Label>
                </div>
              </div>
            </RadioGroup>
          </m.div>
        )}

        {/* Payment details */}
        {currentStep === "details" && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="font-bold text-xl mb-4">Détails du paiement</h2>

            {paymentMethod === "stripe" ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Nom sur la carte</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardDetails.cardName}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cardName: e.target.value,
                      })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="cardNumber">Numéro de carte</Label>
                  <Input
                    id="cardNumber"
                    placeholder="4242 4242 4242 4242"
                    value={cardDetails.cardNumber}
                    onChange={(e) =>
                      setCardDetails({
                        ...cardDetails,
                        cardNumber: formatCardNumber(e.target.value),
                      })
                    }
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="expiry">Date d&apos;expiration</Label>
                    <Input
                      id="expiry"
                      placeholder="MM/YY"
                      value={cardDetails.expiry}
                      onChange={(e) =>
                        setCardDetails({
                          ...cardDetails,
                          expiry: formatExpiry(e.target.value),
                        })
                      }
                      maxLength={5}
                    />
                  </div>

                  <div>
                    <Label htmlFor="cvc">CVC</Label>
                    <Input
                      id="cvc"
                      placeholder="123"
                      value={cardDetails.cvc}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, "");
                        setCardDetails({ ...cardDetails, cvc: value });
                      }}
                      maxLength={3}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 text-sm text-gray-500 mt-4">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 16V12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 8H12.01"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>
                    Vos informations de paiement sont sécurisées et chiffrées
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-center p-8">
                <div className="mb-4">
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="mx-auto"
                  >
                    <path
                      d="M19.5 8.25H4.5C3.67157 8.25 3 8.92157 3 9.75V18.75C3 19.5784 3.67157 20.25 4.5 20.25H19.5C20.3284 20.25 21 19.5784 21 18.75V9.75C21 8.92157 20.3284 8.25 19.5 8.25Z"
                      stroke="#0070ba"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7.5 15.75C7.5 15.75 8.25 15 9.75 15C11.25 15 12.75 16.5 14.25 16.5C15.75 16.5 16.5 15.75 16.5 15.75"
                      stroke="#0070ba"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M16.5 8.25V6C16.5 4.34315 15.1569 3 13.5 3H4.5C3.67157 3 3 3.67157 3 4.5V6.75"
                      stroke="#0070ba"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="text-lg font-medium mb-2">
                  Vous allez être redirigé vers PayPal
                </p>
                <p className="text-gray-500 mb-4">
                  Cliquez sur &apos;Continuer&apos; pour finaliser votre
                  paiement sur PayPal
                </p>
              </div>
            )}
          </m.div>
        )}

        {/* Review order */}
        {currentStep === "review" && (
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h2 className="font-bold text-xl mb-4">Vérifiez votre commande</h2>

            <div className="space-y-4">
              <div className="p-4 border border-gray-200 rounded-lg">
                <h5 className="font-bold mb-2">Détails de la commande</h5>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Produit:</span>
                  <span className="font-medium">
                    {isPremium ? "Abonnement Premium" : `${xpAmount} XP`}
                  </span>
                </div>
                <div className="flex justify-between mb-1">
                  <span className="text-gray-600">Prix:</span>
                  <span className="font-medium">${amount.toFixed(2)} USD</span>
                </div>
                {isPremium && (
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600">Période:</span>
                    <span className="font-medium">Mensuel</span>
                  </div>
                )}
              </div>

              <div className="p-4 border border-gray-200 rounded-lg">
                <h5 className="font-bold mb-2">Méthode de paiement</h5>
                <div className="flex items-center gap-3">
                  {paymentMethod === "paypal" ? (
                    <>
                      <div className="bg-[#0070ba] p-1 rounded">
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M19.5 8.25H4.5C3.67157 8.25 3 8.92157 3 9.75V18.75C3 19.5784 3.67157 20.25 4.5 20.25H19.5C20.3284 20.25 21 19.5784 21 18.75V9.75C21 8.92157 20.3284 8.25 19.5 8.25Z"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M7.5 15.75C7.5 15.75 8.25 15 9.75 15C11.25 15 12.75 16.5 14.25 16.5C15.75 16.5 16.5 15.75 16.5 15.75"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M16.5 8.25V6C16.5 4.34315 15.1569 3 13.5 3H4.5C3.67157 3 3 3.67157 3 4.5V6.75"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <span>PayPal</span>
                    </>
                  ) : (
                    <>
                      <div className="bg-[#635bff] p-1 rounded">
                        <CreditCard className="h-5 w-5 text-white" />
                      </div>
                      <span>
                        Carte de crédit se terminant par{" "}
                        {cardDetails.cardNumber.slice(-4)}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                En cliquant sur Confirmer et payer, vous acceptez nos conditions
                générales de vente et notre politique de confidentialité.
              </p>
            </div>
          </m.div>
        )}

        {/* Success message */}
        {currentStep === "success" && (
          <m.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-8 text-center"
          >
            <div className="mb-6">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-4">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Paiement réussi !</h2>
              <p className="text-gray-600">
                {isPremium
                  ? "Votre abonnement Premium est maintenant actif."
                  : `${xpAmount} XP ont été ajoutés à votre compte.`}
              </p>
            </div>

            <div className="p-6 border border-gray-200 rounded-xl bg-gray-50 mb-6 text-left">
              <h3 className="font-bold mb-4">Détails de la transaction</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">ID de transaction:</span>
                  <span className="font-medium">
                    {Math.random().toString(36).substring(2, 10).toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date:</span>
                  <span className="font-medium">
                    {new Date().toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant:</span>
                  <span className="font-medium">${amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Méthode:</span>
                  <span className="font-medium">
                    {paymentMethod === "paypal" ? "PayPal" : "Carte de crédit"}
                  </span>
                </div>
              </div>
            </div>
          </m.div>
        )}

        {/* Action buttons */}
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={handleBack}
            disabled={currentStep === "success"}
          >
            {currentStep === "method" ? "Annuler" : "Retour"}
          </Button>

          <Button
            onClick={handleContinue}
            disabled={
              (currentStep === "method" && !paymentMethod) || isProcessing
            }
            className="bg-primary-500 hover:bg-primary-700 min-w-[120px]"
          >
            {isProcessing ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Traitement...</span>
              </div>
            ) : currentStep === "review" ? (
              "Confirmer et payer"
            ) : currentStep === "success" ? (
              "Retour à l'accueil"
            ) : (
              "Continuer"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

"use client";

import { useState, useEffect } from "react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import { useIntl } from "react-intl";
import { useAuth } from "@clerk/nextjs";

import type { IRootState } from "@/store";
import { addGems, removeGems, updateHearts } from "@/store/userSlice";

// Import sub-components
import { ShopHeader } from "./shop-header";
import { GemsBalanceCard } from "./gems-balance-card";
import { HeartPurchaseCard } from "./heart-purchase-card";
import { CurrentHeartsDisplay } from "./current-hearts-display";
import { ShopTabs } from "./shop-tabs";
import { PurchaseConfirmationModal } from "./purchase-confirmation-modal";
import type { Subscription } from "@/types";
import { apiClient } from "@/lib/api-client";
// import { useCSRF } from "@/hooks/use-csrf";

/**
 * Shop item interface
 */
interface ShopItem {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: "hearts" | "premium" | "boosts" | "gems";
  currency: "gems" | "coins" | "USD";
  discount?: number;
  popular?: boolean;
  gemsAmount?: number;
  featured?: boolean;
  type?: string;
}

/**
 * Enhanced shop settings interface based on PaymentSettings model
 */
interface ShopSettings {
  currencies: {
    hearts: {
      gemsCost: number;
      maxAmount: number;
      refillTimeHours: number;
      enabled: boolean;
    };
    gems: {
      exchangeRate: number;
      enabled: boolean;
      dailyBonus: number;
    };
    defaultCurrency: string;
  };
  general: {
    enablePayments: boolean;
    testMode: boolean;
    companyName: string;
  };
}

/**
 * Shop Component
 *
 * Main shop component that handles:
 * - Fetching shop items from API with enhanced PaymentSettings integration
 * - Managing user purchases with proper currency conversion
 * - Heart purchasing functionality with configurable costs
 * - Gem management with exchange rates
 * - Navigation to payment flows
 * - Regional pricing support
 *
 * Features:
 * - Real-time gem balance updates
 * - Heart purchase with quantity selection based on PaymentSettings
 * - Category-based item filtering
 * - Purchase confirmation modals
 * - Integration with payment system
 * - Support for multiple currencies and regions
 */
export default function Shop({ subscription }: { subscription: Subscription }) {
  const router = useLocalizedRouter();
  const hasPremium = subscription.subscription === "premium";
  const dispatch = useDispatch();
  const user = useSelector((state: IRootState) => state.user);
  const intl = useIntl();
  const { getToken, userId } = useAuth();

  // Component state
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [shopSettings, setShopSettings] = useState<ShopSettings>({
    currencies: {
      hearts: {
        gemsCost: 500,
        maxAmount: 5,
        refillTimeHours: 5,
        enabled: true,
      },
      gems: {
        exchangeRate: 100,
        enabled: true,
        dailyBonus: 5,
      },
      defaultCurrency: "USD",
    },
    general: {
      enablePayments: true,
      testMode: true,
      companyName: "TULU",
    },
  });
  const [isLoading, setIsLoading] = useState(true);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [lastPurchase, setLastPurchase] = useState<{
    quantity: number;
    cost: number;
  } | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  // const { getCSRFHeaders } = useCSRF();

  /**
   * Fetch shop data from API with enhanced PaymentSettings integration
   */
  useEffect(() => {
    const fetchShopData = async () => {
      try {
        setIsLoading(true);

        const token = await getToken();
        const response = await apiClient.get("/api/shop", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = response.data;

        if (data.success) {
          setShopItems(data.data.items);

          setShopSettings({
            currencies: {
              hearts: {
                gemsCost: data.data.settings.heartCostInGems || 500,
                maxAmount: data.data.settings.maxHearts || 5,
                refillTimeHours: data.data.settings.heartRefillTimeHours || 5,
                enabled: data.data.settings.heartsEnabled !== false,
              },
              gems: {
                exchangeRate: data.data.settings.gemExchangeRate || 100,
                enabled: data.data.settings.gemsEnabled !== false,
                dailyBonus: data.data.settings.gemsDailyBonus || 5,
              },
              defaultCurrency: data.data.settings.defaultCurrency || "USD",
            },
            general: {
              enablePayments: data.data.settings.paymentsEnabled !== false,
              testMode: data.data.settings.testMode !== false,
              companyName: data.data.settings.companyName || "TULU",
            },
          });

          console.log("Shop settings loaded:", data.data.settings);
        } else {
          toast.error(
            intl.formatMessage({
              id: "shop.error.fetch",
              defaultMessage: "Failed to load shop data",
            })
          );
        }
      } catch (error) {
        console.error("Error fetching shop data:", error);
        toast.error(
          intl.formatMessage({
            id: "shop.error.network",
            defaultMessage: "Network error. Please try again.",
          })
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchShopData();
  }, [intl, getToken]);

  /**
   * API call to update user gems with CSRF protection
   * @param amount - Amount of gems to add/remove
   * @param action - Action type: "inc" for increment, "dec" for decrement
   * @returns Promise with API response data
   */
  const updateUserGems = async (amount: number, action: "inc" | "dec") => {
    try {
      const token = await getToken();
      const response = await apiClient.put(
        `/api/users/${userId}/gems?action=${action}`,
        { amount },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            // ...getCSRFHeaders(),
          },
        }
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || "Failed to update gems");
      }
    } catch (error) {
      console.error("Error updating gems:", error);
      throw error;
    }
  };

  /**
   * API call to update user hearts
   */
  const updateUserHearts = async (amount: number, action: "inc" | "dec") => {
    try {
      const token = await getToken();
      const response = await apiClient.put(
        `/api/users/${userId}/hearts?action=${action}`,
        { amount },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(response.data.error || "Failed to update hearts");
      }
    } catch (error) {
      console.error("Error updating hearts:", error);
      throw error;
    }
  };

  /**
   * API call to create a purchase record with CSRF protection
   * @param itemId - ID of the purchased item
   * @param quantity - Quantity purchased (default: 1)
   * @param paymentMethod - Payment method used
   * @returns Promise with purchase record data
   */
  const createPurchaseRecord = async (
    itemId: string,
    quantity = 1,
    paymentMethod: string
  ) => {
    try {
      const token = await getToken();
      const response = await apiClient.post(
        `/api/users/${userId}/purchases`,
        {
          itemId,
          quantity,
          paymentMethod,
          platform: "web",
          deviceType: "desktop",
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            // ...getCSRFHeaders(),
          },
        }
      );

      if (response.data.success) {
        return response.data;
      } else {
        throw new Error(
          response.data.error || "Failed to create purchase record"
        );
      }
    } catch (error) {
      console.error("Error creating purchase record:", error);
      throw error;
    }
  };

  /**
   * Handle heart purchase with PaymentSettings integration
   */
  const handleHeartPurchase = async (quantity: number, totalCost: number) => {
    setIsPurchasing(true);
    const maxHearts = shopSettings.currencies.hearts.maxAmount || 5;

    // Check if user already has max hearts or would exceed max hearts
    if (user.hearts >= maxHearts) {
      toast.error(
        intl.formatMessage(
          {
            id: "shop.hearts.max.reached",
            defaultMessage:
              "You already have the maximum number of hearts ({max})!",
          },
          { max: maxHearts }
        )
      );
      return;
    }

    // Check if purchase would exceed max hearts
    if (user.hearts + quantity > maxHearts) {
      const allowedPurchase = maxHearts - user.hearts;
      toast.warning(
        intl.formatMessage(
          {
            id: "shop.hearts.partial.allowed",
            defaultMessage:
              "You can only purchase {allowed} more hearts to reach your maximum of {max}.",
          },
          { allowed: allowedPurchase, max: maxHearts }
        )
      );
      return;
    }

    if (!shopSettings.currencies.hearts.enabled) {
      toast.error(
        intl.formatMessage({
          id: "shop.hearts.disabled",
          defaultMessage: "Heart purchases are currently disabled",
        })
      );
      return;
    }

    if (user.gems >= totalCost) {
      try {
        // First decrease gems
        await updateUserGems(totalCost, "dec");
        dispatch(removeGems(totalCost));

        // Then increase hearts
        await updateUserHearts(quantity, "inc");
        dispatch(updateHearts(quantity));

        setLastPurchase({ quantity, cost: totalCost });
        setShowConfirmation(true);

        toast.success(
          intl.formatMessage({
            id: "shop.hearts.purchase.success",
            defaultMessage: "Hearts purchased successfully!",
          })
        );

        // Hide confirmation after 3 seconds
        setTimeout(() => {
          setShowConfirmation(false);
          setLastPurchase(null);
        }, 3000);
      } catch (error) {
        console.error("Error during heart purchase:", error);
        toast.error(
          intl.formatMessage({
            id: "shop.hearts.purchase.error",
            defaultMessage: "Failed to purchase hearts. Please try again.",
          })
        );
      }
    } else {
      toast.error(
        intl.formatMessage({
          id: "shop.insufficient.gems",
          defaultMessage: "Insufficient gems for this purchase",
        })
      );
    }
  };

  /**
   * Handle gem purchases (redirect to payment) with currency support
   */
  const handleBuyGems = (gemsAmount: number) => {
    if (!shopSettings.currencies.gems.enabled) {
      toast.error(
        intl.formatMessage({
          id: "shop.gems.disabled",
          defaultMessage: "Gem purchases are currently disabled",
        })
      );
      return;
    }

    if (!shopSettings.general.enablePayments) {
      toast.error(
        intl.formatMessage({
          id: "shop.payments.disabled",
          defaultMessage: "Payments are currently disabled",
        })
      );
      return;
    }

    const queryParams = new URLSearchParams({
      type: "gems",
      gemsAmount: gemsAmount.toString(),
      currency: shopSettings.currencies.defaultCurrency,
      testMode: shopSettings.general.testMode.toString(),
    });

    router.push(`/payment?${queryParams.toString()}`);
  };

  /**
   * Handle premium upgrade (redirect to payment)
   */
  const handleUpgradePremium = () => {
    if (!shopSettings.general.enablePayments) {
      toast.error(
        intl.formatMessage({
          id: "shop.payments.disabled",
          defaultMessage: "Payments are currently disabled",
        })
      );
      return;
    }

    const queryParams = new URLSearchParams({
      type: "premium",
      currency: shopSettings.currencies.defaultCurrency,
      testMode: shopSettings.general.testMode.toString(),
    });

    router.push(`/payment?${queryParams.toString()}`);
  };

  /**
   * Handle general item purchases with currency conversion and API integration
   */
  const handlePurchaseItem = async (item: ShopItem) => {
    if (isPurchasing) return; // Prevent multiple clicks

    setIsPurchasing(true);

    const maxHearts = shopSettings.currencies.hearts.maxAmount;
    if (item.category === "hearts") {
      if (user.hearts > 0) {
        const allowedPurchase = maxHearts - user.hearts;
        toast.warning(
          intl.formatMessage(
            {
              id: "shop.hearts.partial.allowed",
              defaultMessage:
                "You can only purchase {allowed} more hearts to reach your maximum of {max}.",
            },
            { allowed: allowedPurchase, max: maxHearts }
          )
        );
        return;
      }
    }

    try {
      if (item.currency === "gems" && user.gems >= item.price) {
        // Create purchase record in database
        await createPurchaseRecord(item.id, 1, "gems");

        if (item.category === "hearts") {
          await updateUserHearts(maxHearts, "inc");
          dispatch(updateHearts(maxHearts));
        }
        // Update local state
        dispatch(removeGems(item.price));

        toast.success(
          intl.formatMessage({
            id: "shop.item.purchase.success",
            defaultMessage: "Item purchased successfully!",
          })
        );
        setIsPurchasing(false);
      } else if (item.currency === "USD") {
        const queryParams = new URLSearchParams({
          type: "item",
          itemId: item.id,
          currency: shopSettings.currencies.defaultCurrency,
          testMode: shopSettings.general.testMode.toString(),
        });

        router.push(`/payment?${queryParams.toString()}`);
      } else {
        toast.error(
          intl.formatMessage({
            id: "shop.insufficient.currency",
            defaultMessage: "Insufficient currency for this purchase",
          })
        );
      }
    } catch (error) {
      console.error("Error during item purchase:", error);
      toast.error(
        intl.formatMessage({
          id: "shop.purchase.error",
          defaultMessage: "Failed to complete purchase. Please try again.",
        })
      );
    } finally {
      setIsPurchasing(false);
    }
  };

  /**
   * Handle adding gems (for demo purposes) with exchange rate consideration
   */
  const handleAddGems = async (amount: number) => {
    if (!hasPremium) {
      toast.error(
        intl.formatMessage({
          id: "shop.upgradeToPremium",
          defaultMessage: "Get premium access to add gems for free",
        })
      );
      return;
    }

    // Apply exchange rate if configured
    const actualAmount = Math.floor(
      amount * (shopSettings.currencies.gems.exchangeRate / 100)
    );

    // Prevent adding too many gems
    if (actualAmount > 1000) {
      toast.error(
        intl.formatMessage({
          id: "shop.gems.limit.exceeded",
          defaultMessage: "You can't add more than 1000 gems at once.",
        })
      );
      return;
    }

    try {
      // Call API to update gems in database
      await updateUserGems(actualAmount, "inc");

      // Update Redux store
      dispatch(addGems(actualAmount));

      toast.success(
        intl.formatMessage(
          {
            id: "shop.gems.added",
            defaultMessage: "Gems added successfully!",
          },
          { amount: actualAmount }
        )
      );
    } catch (error) {
      console.log(error);
      toast.error(
        intl.formatMessage({
          id: "shop.gems.add.error",
          defaultMessage: "Failed to add gems. Please try again.",
        })
      );
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#58cc02] mx-auto mb-4"></div>
          <p className="text-gray-600">
            {intl.formatMessage({
              id: "shop.loading",
              defaultMessage: "Loading shop...",
            })}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <ShopHeader
        onBack={() => router.push("/dashboard")}
        userGems={user.gems}
      />

      {/* Main content */}
      <div className="flex-1 p-4 max-w-3xl mx-auto w-full">
        {/* Gems Balance Card */}
        <GemsBalanceCard
          userGems={user.gems}
          onAddGems={handleAddGems}
          hasPremium={hasPremium}
        />

        {/* Heart Purchase Card - only show if hearts are enabled */}
        {shopSettings.currencies.hearts.enabled && (
          <HeartPurchaseCard
            userGems={user.gems}
            heartCostInGems={shopSettings.currencies.hearts.gemsCost}
            // maxHearts={shopSettings.currencies.hearts.maxAmount}
            // currentHearts={user.hearts}
            onPurchase={handleHeartPurchase}
            isPurchasing={isPurchasing}
          />
        )}

        {/* Current Hearts Display */}
        <CurrentHeartsDisplay
          currentHearts={user.hearts}
          maxHearts={shopSettings.currencies.hearts.maxAmount}
        />

        {/* Shop Items Tabs */}
        <ShopTabs
          items={shopItems}
          userGems={user.gems}
          onBuyGems={handleBuyGems}
          onUpgradePremium={handleUpgradePremium}
          onPurchaseItem={handlePurchaseItem}
          isPurchasing={isPurchasing}
        />

        {/* Payment Settings Info (for debugging in test mode) */}
        {shopSettings.general.testMode && (
          <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h3 className="font-bold text-yellow-800 mb-2">
              {intl.formatMessage({
                id: "shop.test.mode",
                defaultMessage: "Test Mode Active",
              })}
            </h3>
            <div className="text-sm text-yellow-700 space-y-1">
              <p>Company: {shopSettings.general.companyName}</p>
              <p>Default Currency: {shopSettings.currencies.defaultCurrency}</p>
              <p>Heart Cost: {shopSettings.currencies.hearts.gemsCost} gems</p>
            </div>
          </div>
        )}
      </div>

      {/* Purchase Confirmation Modal */}
      {lastPurchase && (
        <PurchaseConfirmationModal
          isOpen={showConfirmation}
          onClose={() => setShowConfirmation(false)}
          heartQuantity={lastPurchase.quantity}
          totalCost={lastPurchase.cost}
        />
      )}
    </div>
  );
}

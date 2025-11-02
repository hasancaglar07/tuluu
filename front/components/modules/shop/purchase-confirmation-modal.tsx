"use client";

import { m, AnimatePresence } from "framer-motion";
import { ShoppingCart } from "lucide-react";
import { FormattedMessage } from "react-intl";
import { Button } from "@/components/ui/button";

/**
 * PurchaseConfirmationModal Component
 *
 * Displays a confirmation modal after successful purchase.
 *
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {number} props.heartQuantity - Number of hearts purchased
 * @param {number} props.totalCost - Total cost of the purchase
 */
export function PurchaseConfirmationModal({
  isOpen,
  onClose,
  heartQuantity,
  totalCost,
}: {
  isOpen: boolean;
  onClose: () => void;
  heartQuantity: number;
  totalCost: number;
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        >
          <m.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-white rounded-xl p-6 max-w-md w-full"
          >
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="bg-green-100 p-4 rounded-full">
                  <ShoppingCart className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <h2 className="text-xl font-bold mb-2">
                <FormattedMessage
                  id="shop.purchase.success.title"
                  defaultMessage="Purchase Successful!"
                />
              </h2>
              <p className="text-gray-600 mb-4">
                <FormattedMessage
                  id="shop.purchase.success.message"
                  defaultMessage="You have purchased {quantity} heart{plural} for {cost} Gems."
                  values={{
                    quantity: heartQuantity,
                    plural: heartQuantity > 1 ? "s" : "",
                    cost: totalCost.toLocaleString(),
                  }}
                />
              </p>

              <Button onClick={onClose} className="w-full">
                <FormattedMessage
                  id="shop.continue"
                  defaultMessage="Continue"
                />
              </Button>
            </div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

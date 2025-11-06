"use client";

import Container from "@/components/custom/container";
import { Button } from "@/components/ui/button";
import React from "react";
import { useIntl } from "react-intl";

/**
 * FooterWelcome Component
 * -----------------------
 * A footer section displayed at the bottom of the welcome screen.
 * Includes a primary button to trigger the dashboard transition with animation.
 *
 * Props:
 * - goToDashboard: Function to navigate to the dashboard and trigger confetti.
 * - isLoading: Boolean to disable button while loading.
 * - setText: Function to update parent TypingAnimation text.
 */
export default function FooterWelcome({
  goToDashboard,
  isLoading,
  setText,
}: {
  goToDashboard: () => void;
  isLoading: boolean;
  setText: (v: string) => void;
}) {
  const intl = useIntl();

  /**
   * Handle button click:
   * - Updates text using react-intl for animation
   * - Triggers confetti + dashboard redirect
   */
  const handleClick = () => {
    const text = intl.formatMessage({ id: "welcome.readyText" }); // 🔄 Localized "ready" animation message
    setText(text);
    goToDashboard();
  };

  return (
    <section className="fixed bottom-0 left-0 right-0 py-4 sm:py-6 md:py-10 md:px-20 border-t border-t-gray-200 bg-white dark:bg-gray-900 dark:border-t-gray-700 shadow-lg z-50 pb-safe">
      <Container>
        <div className="flex justify-center sm:justify-end">
          <Button
            variant="primary"
            size="lg"
            onClick={handleClick}
            disabled={isLoading}
            className="w-full sm:w-auto min-w-[200px]"
          >
            {/* 🌍 Localized CTA button text */}
            {intl.formatMessage({
              id: "welcome.cta",
            })}
          </Button>
        </div>
      </Container>
    </section>
  );
}

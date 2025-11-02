"use client";

import { m, AnimatePresence } from "framer-motion";
import Lottie from "lottie-react";
import mascotAnimation from "@/public/images/mascot_header.json";
import { useIntl } from "react-intl";

interface LoadingProps {
  isLoading?: boolean;
}

export default function Loading({ isLoading = true }: LoadingProps) {
  const intl = useIntl();
  
  return (
    <AnimatePresence>
      {isLoading && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
        >
          <m.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.5, opacity: 0 }}
            transition={{ type: "spring", duration: 0.5 }}
            className="relative flex flex-col items-center"
          >
            <div className="w-48 h-48">
              <Lottie
                animationData={mascotAnimation}
                loop={true}
                autoplay={true}
              />
            </div>
            <m.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-lg font-semibold text-primary"
            >
              {intl.formatMessage({ id: "common.loading" })}
            </m.div>
          </m.div>
        </m.div>
      )}
    </AnimatePresence>
  );
}

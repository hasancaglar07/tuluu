"use client";

import { m, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { Sparkles, Rocket, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";

const encouragingMessages = [
  "You're crushing it! 🚀",
  "Keep the momentum going! ✨",
  "Your brain is leveling up! 🧠",
  "Almost fluent! Keep going! 🌟",
];

const sparkleVariants = {
  animate: {
    opacity: [0, 1, 0],
    scale: [0.5, 1.5, 0.5],
    y: [-5, -20, -5],
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: "easeInOut",
      delay: Math.random(),
    },
  },
};

const ContinueLearningEncouragement = () => {
  const router = useLocalizedRouter();
  const [messageIndex, setMessageIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setMessageIndex((prev) => (prev + 1) % encouragingMessages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <m.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative bg-gradient-to-br from-indigo-100 to-purple-100 border border-purple-200 shadow-2xl p-8 rounded-3xl text-center max-w-xl mx-auto mt-12 overflow-hidden"
    >
      {/* Floating sparkles */}
      {[...Array(6)].map((_, i) => (
        <m.div
          key={i}
          className="absolute text-purple-400"
          style={{
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
          variants={sparkleVariants}
          animate="animate"
        >
          <Sparkles className="w-4 h-4" />
        </m.div>
      ))}

      <m.div
        initial={{ scale: 0.7 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
        className="text-purple-600 mb-4"
      >
        <PartyPopper className="w-10 h-10" />
      </m.div>

      <AnimatePresence mode="wait">
        <m.h2
          key={encouragingMessages[messageIndex]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.5 }}
          className="text-2xl font-extrabold text-gray-800 mb-2"
        >
          {encouragingMessages[messageIndex]}
        </m.h2>
      </AnimatePresence>

      <p className="text-gray-600 text-lg mb-6">
        Every step you take brings you closer to mastery. Keep the fire alive!
        🔥
      </p>

      <Button
        onClick={() => router.push("/dashboard")}
        className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white hover:brightness-110 hover:scale-105 transition-all duration-300 rounded-full px-6 py-3 text-lg font-semibold"
      >
        <Rocket className="mr-2 w-5 h-5" />
        Go to Dashboard
      </Button>
    </m.div>
  );
};

export default ContinueLearningEncouragement;

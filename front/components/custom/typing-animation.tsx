"use client";

import { useState, useEffect } from "react";

interface TypingAnimationProps {
  text: string;
  speed?: number;
  delay?: number;
  className?: string;
}

export function TypingAnimation({
  text,
  speed = 50,
  delay = 0,
  className = "",
}: TypingAnimationProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDelaying, setIsDelaying] = useState(true);

  useEffect(() => {
    if (isDelaying) {
      const delayTimer = setTimeout(() => {
        setIsDelaying(false);
      }, delay);

      return () => clearTimeout(delayTimer);
    }

    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, delay, isDelaying, speed, text]);

  return (
    <span className={className}>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

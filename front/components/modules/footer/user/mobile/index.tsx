"use client";

import { m } from "framer-motion";
import { Heart, Shield, Star } from "lucide-react";
import React from "react";

export default function MobileFooterDashboard() {
  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
      <div className="flex justify-between items-center">
        <m.div
          className="flex flex-col items-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="bg-[#1cb0f6] p-2 rounded-full">
            <Star className="text-white h-5 w-5" />
          </div>
          <span className="text-xs mt-1">Leçons</span>
        </m.div>
        <m.div
          className="flex flex-col items-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="bg-[#ffc800] p-2 rounded-full">
            <Shield className="text-white h-5 w-5" />
          </div>
          <span className="text-xs mt-1">Ligues</span>
        </m.div>
        <m.div
          className="flex flex-col items-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="bg-[#ff4b4b] p-2 rounded-full">
            <Heart className="text-white h-5 w-5" />
          </div>
          <span className="text-xs mt-1">0</span>
        </m.div>
        <m.div
          className="flex flex-col items-center"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <div className="bg-[#ce82ff] p-2 rounded-full">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="text-white"
            >
              <circle cx="12" cy="12" r="10" fill="#CE82FF" />
              <circle cx="12" cy="8" r="4" fill="white" />
              <path
                d="M4 19C4 16.7909 7.58172 15 12 15C16.4183 15 20 16.7909 20 19V22H4V19Z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-xs mt-1">Profil</span>
        </m.div>
      </div>
    </div>
  );
}

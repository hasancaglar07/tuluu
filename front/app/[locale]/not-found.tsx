"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Home, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { DinosaurGame } from "@/components/custom/dinozaur-game";

export default function NotFound() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <div className="text-8xl font-bold text-gray-300 dark:text-gray-600 select-none">
            404
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Oops! Page Not Found
          </h1>
        </div>

        {/* Dinosaur Game Section */}
        <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-2 border-gray-200 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-2">
                While you&apos;re here, why not play a game?
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Press{" "}
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                  SPACE
                </kbd>{" "}
                or{" "}
                <kbd className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                  CLICK
                </kbd>{" "}
                to jump!
              </p>
            </div>
            <DinosaurGame />
          </CardContent>
        </Card>

        {/* Navigation Options */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Link>
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>

          <Button
            variant="outline"
            size="lg"
            onClick={() => window.location.reload()}
            className="w-full sm:w-auto"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Fun Facts */}
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Fun fact: This dinosaur game was originally created by Google Chrome
            when you&apos;re offline! 🦕
          </p>
        </div>
      </div>
    </div>
  );
}

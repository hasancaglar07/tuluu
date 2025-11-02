"use client";

import React from "react";
import { m } from "framer-motion";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface NextChapterProps {
  chapterNumber: string;
  title: string;
  description: string;
  isLocked?: boolean;
  onAdvance?: () => void;
}

export function NextChapter({
  chapterNumber,
  title,
  description,
  isLocked = true,
  onAdvance,
}: NextChapterProps) {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="max-w-3xl"
    >
      <Card className="w-full mx-auto overflow-hidden border-gray-300 mt-10">
        <CardContent className="p-6">
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
              {isLocked ? (
                <Lock className="w-5 h-5 text-muted-foreground" />
              ) : (
                <span className="text-sm font-medium">{chapterNumber}</span>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xl text-muted-foreground uppercase tracking-wider">
                NEXT CHAPTER
              </p>
              <h5 className="">{title}</h5>
              <p className="text-xl text-muted-foreground">
                {description.length > 140
                  ? `${description.slice(0, 140)}...`
                  : description}
              </p>
            </div>

            <Button
              className="w-full mt-4"
              variant={isLocked ? "outline" : "default"}
              onClick={onAdvance}
            >
              AVANCER ICI ?
            </Button>
          </div>
        </CardContent>
      </Card>
    </m.div>
  );
}

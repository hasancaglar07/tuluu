"use client";

import { X, Heart } from "lucide-react";
import { m } from "framer-motion";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import Image from "next/image";
import Container from "@/components/custom/container";
import { FormattedMessage } from "react-intl";

interface LessonHeaderProps {
  progress: number;
  hearts: number;
  onExit: () => void;
}

/**
 * Lesson Header Component
 * Displays progress bar, hearts count, and exit button with confirmation dialog
 */
export default function LessonHeader({
  progress,
  hearts,
  onExit,
}: LessonHeaderProps) {
  return (
    <header className="py-8">
      <Container>
        <div className="flex items-center justify-between">
          {/* Exit button with confirmation dialog */}
          <Dialog>
            <DialogTrigger asChild>
              <m.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                <X className="h-10 w-10 text-gray-200" />
              </m.button>
            </DialogTrigger>

            <DialogContent className="flex flex-col items-center gap-8 w-fit">
              <DialogTitle>
                <VisuallyHidden>Exit Confirmation</VisuallyHidden>
              </DialogTitle>

              {/* Mascot image */}
              <Image
                src="/images/bobo.gif"
                alt="Exit Mascot"
                className="w-24 h-24"
                width="40"
                height="40"
              />

              {/* Warning message */}
              <h5 className="text-center max-w-sm">
                <FormattedMessage
                  id="lesson.exitWarning"
                  defaultMessage="Wait, don't leave! If you stop now, you'll lose your progress."
                />
              </h5>

              {/* Action buttons */}
              <div className="flex gap-3 flex-col">
                <DialogClose asChild>
                  <Button variant="secondary" size="lg">
                    <FormattedMessage
                      id="button.continueLearning"
                      defaultMessage="Keep Learning"
                    />
                  </Button>
                </DialogClose>

                <Button onClick={onExit} variant="danger">
                  <FormattedMessage
                    id="lesson.backToDashboard"
                    defaultMessage="Back to Dashboard"
                  />
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Progress bar */}
          <div className="flex-1 mx-4">
            <Progress value={progress} className="h-4 bg-gray-200" />
          </div>

          {/* Hearts display */}
          <div className="flex items-center gap-1 text-[#ff4b4b] font-bold">
            <Heart fill="#ff4b4b" size={30} />
            <span className="text-2xl">{hearts}</span>
          </div>
        </div>
      </Container>
    </header>
  );
}

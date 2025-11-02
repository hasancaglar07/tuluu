"use client"

import { m } from "framer-motion"
import { Heart, X } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"
import Container from "@/components/custom/container"
import { Dialog, DialogClose, DialogContent, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { VisuallyHidden } from "@radix-ui/react-visually-hidden"

interface LessonHeaderProps {
  progress: number
  hearts: number
  onExit: () => void
}

export function LessonHeader({ progress, hearts, onExit }: LessonHeaderProps) {
  return (
    <header className="py-8">
      <Container>
        <div className="flex items-center justify-between">
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
              <Image src="/images/bobo.gif" alt="Exit Mascot" className="w-24 h-24" width="40" height="40" />

              <h5 className="text-center max-w-sm">
                Attends, ne pars pas ! Si tu arrêtes maintenant, tu perdras ta progression.
              </h5>

              <div className="flex gap-3 flex-col">
                <DialogClose asChild>
                  <Button variant="secondary" size="lg">
                    Continuer d&apos;apprendre
                  </Button>
                </DialogClose>

                <Button onClick={onExit} variant="destructive">
                  arreter la session
                </Button>
              </div>
            </DialogContent>
          </Dialog>
          <div className="flex-1 mx-4">
            <Progress value={progress} className="h-4 bg-gray-200" />
          </div>
          <div className="flex items-center gap-1 text-[#ff4b4b] font-bold">
            <Heart fill="#ff4b4b" size={30} />
            <span className="text-2xl">{hearts}</span>
          </div>
        </div>
      </Container>
    </header>
  )
}

"use client";

import React, { useCallback, useState } from "react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import confetti from "canvas-confetti";
import dynamic from "next/dynamic";

import Container from "@/components/custom/container";
import { TypingAnimation } from "@/components/custom/typing-animation";
import FooterWelcome from "@/components/modules/footer/welcome";
import { useIntl } from "react-intl";
import welcomeMascotAnimation from "@/public/images/welcome_mascot.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Welcome() {
  const router = useLocalizedRouter();
  const intl = useIntl();
  // Tu peux garder le formatMessage ici si tu veux garder le texte dans un state
  const initialText = intl.formatMessage({ id: "welcome.intro" });
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState(initialText);

  const goToDashboard = useCallback(() => {
    setIsLoading(true);

    confetti({
      particleCount: 120,
      spread: 80,
      angle: 90,
      startVelocity: 45,
      scalar: 1.2,
      origin: { y: 0.6 },
      shapes: ["square", "circle"],
      colors: ["#00C9A7", "#FF6B6B", "#FFD93D", "#6A4C93", "#4ECDC4"],
    });

    setTimeout(() => {
      confetti.reset();
      router.push("/learn");
    }, 500);
  }, [router]);

  return (
    <>
      <section className="py-20 flex-1 flex justify-center items-center">
        <Container>
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col gap-10 relative">
              <div className="flex justify-center">
                {/* Utilisation de FormattedMessage directement dans JSX */}
                {/* Ici on remplace le TypingAnimation text par FormattedMessage */}
                {/* Si TypingAnimation accepte children ou text, adapte en conséquence */}
                <TypingAnimation
                  key={text}
                  className="text-2xl font-bold"
                  // Si TypingAnimation accepte un string "text", on peut fournir le texte traduit ainsi:
                  text={text}
                  speed={30}
                />
              </div>
              <div className="flex items-center justify-center w-full">
                <Lottie
                  animationData={welcomeMascotAnimation}
                  loop={true}
                  style={{ width: 1020, height: 600 }}
                />
              </div>
            </div>
          </div>
        </Container>
      </section>
      <FooterWelcome
        goToDashboard={goToDashboard}
        isLoading={isLoading}
        setText={setText}
      />
    </>
  );
}

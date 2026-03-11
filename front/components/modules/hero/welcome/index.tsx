"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import confetti from "canvas-confetti";
import dynamic from "next/dynamic";
import { useAuth } from "@clerk/nextjs";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api-client";

import Container from "@/components/custom/container";
import { TypingAnimation } from "@/components/custom/typing-animation";
import FooterWelcome from "@/components/modules/footer/welcome";
import { useIntl } from "react-intl";
import welcomeMascotAnimation from "@/public/images/welcome_mascot.json";
import { i18n } from "@/i18n-config";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Welcome() {
  const router = useLocalizedRouter();
  const intl = useIntl();
  const { userId, getToken } = useAuth();
  const params = useParams();
  const localeParam = params?.locale;
  const currentLocale =
    (Array.isArray(localeParam)
      ? localeParam[0]
      : (localeParam as string | undefined)) || i18n.defaultLocale;
  // Tu peux garder le formatMessage ici si tu veux garder le texte dans un state
  const initialText = intl.formatMessage({ id: "welcome.intro" });
  const [isLoading, setIsLoading] = useState(false);
  const [text, setText] = useState(initialText);
  const hasPrefetchedRoutes = useRef(false);
  const hasWarmedWelcomeApis = useRef(false);

  useEffect(() => {
    if (hasPrefetchedRoutes.current) {
      return;
    }

    hasPrefetchedRoutes.current = true;
    router.prefetch("/learn");
    router.prefetch("/dashboard");
    router.prefetch("/stories");
    router.prefetch("/leaderboard");
    router.prefetch("/quests");
    router.prefetch("/shop");
  }, [router]);

  useEffect(() => {
    if (!userId || hasWarmedWelcomeApis.current) {
      return;
    }

    hasWarmedWelcomeApis.current = true;
    let cancelled = false;

    const warmWelcomeApis = async () => {
      const token = await getToken();
      if (!token || cancelled) {
        return;
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      await Promise.allSettled([
        apiClient.get(
          `/api/public/lessons?action=learn&locale=${currentLocale}&detail=summary`
        ),
        apiClient.get(`/api/users/${userId}`, {
          headers,
          params: { fast: 1 },
        }),
        apiClient.get(`/api/users/${userId}/quests`, {
          headers,
          params: { type: "daily" },
        }),
        apiClient.get(`/api/leaderboards`, {
          headers,
          params: { timeFilter: "allTime", limit: "50" },
        }),
        apiClient.get(`/api/shop`, { headers }),
      ]);
    };

    void warmWelcomeApis();

    return () => {
      cancelled = true;
    };
  }, [currentLocale, getToken, userId]);

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
      <section className="py-8 sm:py-12 md:py-20 pb-32 md:pb-40 flex-1 flex justify-center items-center min-h-screen">
        <Container>
          <div className="flex flex-col items-center justify-center gap-6 sm:gap-8 md:gap-10">
            <div className="flex justify-center px-4 text-center">
              {/* Utilisation de FormattedMessage directement dans JSX */}
              {/* Ici on remplace le TypingAnimation text par FormattedMessage */}
              {/* Si TypingAnimation accepte children ou text, adapte en conséquence */}
              <TypingAnimation
                key={text}
                className="text-xl sm:text-2xl md:text-3xl font-bold"
                // Si TypingAnimation accepte un string "text", on peut fournir le texte traduit ainsi:
                text={text}
                speed={30}
              />
            </div>
            <div className="flex items-center justify-center w-full max-w-full overflow-hidden">
              <Lottie
                animationData={welcomeMascotAnimation}
                loop={true}
                className="w-full max-w-xs sm:max-w-md md:max-w-lg lg:max-w-2xl h-auto"
              />
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

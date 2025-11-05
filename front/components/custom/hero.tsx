"use client";

import React from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { GridBackground } from "../ui/grid-background";
import { LocaleLink } from "./locale-link";
import { FormattedMessage } from "react-intl";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { cn } from "@/lib/utils";
import dynamic from "next/dynamic";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const Hero = ({ className }: { className: string }) => {
  const router = useLocalizedRouter();

  const handleClick = () => {
    router.push("/welcome");
  };

  return (
    <GridBackground
      className="flex items-center justify-center flex-1"
      dotColor="rgba(102, 90, 240, 0.15)"
      dotSize={1.4}
      dotSpacing={20}
    >
      <div className={cn("container mx-auto px-4 md:px-6", className)}>
        <div className="flex flex-col items-center text-center">
          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="md:hidden w-32 h-32"
          >
            <Lottie
              animationData={require("@/public/images/header_mascot.json")}
              loop={true}
              autoplay={true}
            />
          </m.div>

          <m.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            TULU
          </m.h1>

          <m.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-lg md:text-xl text-muted-foreground max-w-3xl mb-8"
          >
            <span className="font-bold">
              <FormattedMessage id="hero.subtitle" />
            </span>
            <br />
            <FormattedMessage id="hero.description" />
          </m.p>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button size="lg" variant="primary" onClick={handleClick}>
              <FormattedMessage id="hero.getStarted" />
            </Button>
            <Button size="lg" variant="outline" className="group" asChild>
              <LocaleLink href="/sign-in">
                <FormattedMessage id="hero.haveAccount" />
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </LocaleLink>
            </Button>
          </m.div>

          <m.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-3xl my-20"
          >
            <StatCard number="7+" labelId="hero.languages" delay={0.5} />
            <StatCard number="1K+" labelId="hero.learners" delay={0.6} />
            <StatCard number="5K+" labelId="hero.visits" delay={0.7} />
          </m.div>
        </div>
      </div>
    </GridBackground>
  );
};

const StatCard = ({
  number,
  labelId,
  defaultLabel,
  delay = 0,
}: {
  number: string;
  labelId: string;
  defaultLabel?: string;
  delay?: number;
}) => {
  return (
    <m.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className="flex flex-col items-center"
    >
      <h3 className="text-3xl md:text-4xl font-bold text-primary">{number}</h3>
      <p className="text-muted-foreground">
        <FormattedMessage id={labelId} defaultMessage={defaultLabel} />
      </p>
    </m.div>
  );
};

export default Hero;

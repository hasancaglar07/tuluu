"use client";

import Container from "@/components/custom/container";
import { LocaleLink } from "@/components/custom/locale-link";
import { Button } from "@/components/ui/button";
import React from "react";
import { useIntl } from "react-intl";

export default function HeroLanding() {
  const intl = useIntl();

  return (
    <section className="py-20 md:py-50 md:px-20 flex-1">
      <Container>
        <div className="grid grid-cols-1 gap-20 md:grid-cols-1 md:gap-10 items-center">
          {/* <Image
            className="w-full h-auto"
            src="/images/hero.gif"
            width="0"
            height="0"
            alt="hero"
          /> */}
          <div className="flex flex-col gap-10 items-center text-center">
            <div className="flex flex-col gap-4">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold leading-tight">
                {intl.formatMessage({ id: "hero.title" })}
              </h1>
              <h2 className="text-xl md:text-2xl lg:text-3xl font-medium text-gray-700">
                {intl.formatMessage({ id: "hero.subtitle" })}
              </h2>
            </div>
            <div className="flex flex-col gap-4">
              <Button variant="primary" className="uppercase" asChild>
                <LocaleLink href="/learn">
                  {intl.formatMessage({ id: "hero.getStarted" })}
                </LocaleLink>
              </Button>
              <Button
                variant="outline"
                className="text-gray-500 font-bold"
                asChild
              >
                <LocaleLink href="/sign-in">
                  {intl.formatMessage({ id: "hero.haveAccount" })}
                </LocaleLink>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

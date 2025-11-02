"use client";

import Container from "@/components/custom/container";
import { LocaleLink } from "@/components/custom/locale-link";
import { Button } from "@/components/ui/button";
import React from "react";

export default function HeroLanding() {
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
          <div className="flex flex-col gap-10 items-center">
            <h2 className="">An enjoyable way to learn a new language!</h2>
            <div className="flex flex-col gap-4">
              <Button variant="primary" className="uppercase" asChild>
                <LocaleLink href="/learn">get started</LocaleLink>
              </Button>
              <Button
                variant="outline"
                className="text-gray-500 font-bold"
                asChild
              >
                <LocaleLink href="/sign-in">
                  i already have an account
                </LocaleLink>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

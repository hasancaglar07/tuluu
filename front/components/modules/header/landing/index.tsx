"use client";

import Container from "@/components/custom/container";
import LanguageSwitcher from "@/components/custom/language-switcher";
import Logo from "@/components/custom/logo";
import { cn } from "@/lib/utils";
import React from "react";

export default function HeaderLanding({ className }: { className?: string }) {
  return (
    <section className={cn(className)}>
      <Container>
        <div className="flex justify-between items-center h-30">
          {/* logo */}
          <Logo />

          {/* language switch  */}
          <LanguageSwitcher className="" />
        </div>
      </Container>
    </section>
  );
}

"use client";

import Container from "@/components/custom/container";
import LanguageSwitcher from "@/components/custom/language-switcher";
import Logo from "@/components/custom/logo";
import React from "react";

export default function HeaderPage() {
  return (
    <section>
      <Container>
        <div className="flex justify-center md:justify-between items-center h-16">
          {/* logo */}
          <Logo />

          {/* language switch  */}
          <LanguageSwitcher className="hidden md:flex" />
        </div>
      </Container>
    </section>
  );
}

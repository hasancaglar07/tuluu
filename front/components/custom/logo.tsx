"use client";

import Image from "next/image";
import React from "react";
import { LocaleLink } from "./locale-link";
import dynamic from "next/dynamic";
import { cn } from "@/lib/utils";
import headerMascotAnimation from "@/public/images/header_mascot.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Logo({
  className,
  hideIcon = false,
}: {
  className?: string;
  hideIcon?: boolean;
}) {
  return (
    <LocaleLink
      href="/"
      className={cn(className, "flex items-center justify-center gap-0")}
    >
      {!hideIcon && (
        <div className="flex items-center justify-center" style={{ width: 150, height: 150 }}>
          <Lottie
            animationData={headerMascotAnimation}
            loop={true}
            style={{ width: 150, height: 150 }}
          />
        </div>
      )}
      <Image
        className="mt-4 -ml-8"
        src="/images/logo.png"
        width="300"
        height="300"
        alt="logo"
      />
    </LocaleLink>
  );
}

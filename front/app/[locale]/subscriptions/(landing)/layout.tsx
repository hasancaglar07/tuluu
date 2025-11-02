import HeaderAuth from "@/components/modules/header/auth";
import React from "react";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <HeaderAuth link="/dashboard" />
      <div className="flex flex-col items-center justify-center h-full">
        <div className="flex flex-col gap-4 justify-center item-center my-12">
          <h3 className="text-center">Pricing plans</h3>
          <h6>
            From free plan to complete premium plan, enjoy learning your
            favorite language.
          </h6>
        </div>
        {children}
      </div>
    </>
  );
}

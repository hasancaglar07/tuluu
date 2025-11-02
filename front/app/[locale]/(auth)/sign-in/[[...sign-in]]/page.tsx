"use client";
import useAuth from "@/hooks/useAuth";
import { SignIn } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

export default function Page() {
  const { isLoaded, user } = useAuth(); // Use the custom useAuth hook

  if (isLoaded && !user) {
    return (
      <div className="flex flex-col gap-4 flex-1 justify-center items-center py-10">
        <SignIn fallbackRedirectUrl="/learn" />
        <p className="md:hidden text-sm text-gray-500">
          Don&apos;t have an account
          <Link
            href="/sign-up"
            className="text-blue-500 hover:underline mx-1 uppercase"
          >
            Sign up
          </Link>
        </p>
      </div>
    );
  }
}

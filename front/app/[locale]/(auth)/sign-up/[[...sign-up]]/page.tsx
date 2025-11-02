"use client";
import useAuth from "@/hooks/useAuth";
import { SignUp } from "@clerk/nextjs";
import Link from "next/link";
import React from "react";

export default function Page() {
  const { isLoaded, user } = useAuth(); // Use the custom useAuth hook

  if (isLoaded && !user) {
    return (
      <div className="flex flex-col gap-4 flex-1 justify-center items-center py-10">
        <SignUp />
        <p className="md:hidden">
          have an account
          <Link
            href="/sign-in"
            className="text-blue-500 hover:underline mx-1 uppercase"
          >
            Sign in
          </Link>
        </p>
      </div>
    );
  }
}

"use client";

import Container from "@/components/custom/container";
import Link from "next/link";
import React from "react";

export default function FooterAuth() {
  return (
    <section className="py-10 md:px-20 border-t border-t-gray-200 bg-white dark:bg-gray-900 dark:border-t-gray-700">
      <Container className="">
        <div>
          <div className="flex flex-col gap-2 text-center text-gray-500">
            <p className="text-sm">
              By signing in to TULU, you agree to our
              <Link
                target="_blank"
                href={`${process.env.NEXT_PUBLIC_SERVER_URL}/terms`}
                className="text-blue-500 hover:underline mx-1"
              >
                Terms
              </Link>
              and
              <Link
                target="_blank"
                href={`${process.env.NEXT_PUBLIC_SERVER_URL}/privacy-policy`}
                className="text-blue-500 hover:underline mx-1"
              >
                Privacy Policy.
              </Link>
            </p>

            <p className="text-sm">
              This site is protected by reCAPTCHA Enterprise and the Google
              <Link
                target="_blank"
                href="https://policies.google.com/privacy"
                className="text-blue-500 hover:underline mx-1"
              >
                Privacy Policy.
              </Link>
              and
              <Link
                target="_blank"
                href="https://policies.google.com/terms"
                className="text-blue-500 hover:underline mx-1"
              >
                Terms of Service
              </Link>
              apply.
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}

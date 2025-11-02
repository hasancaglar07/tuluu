"use client";

import Container from "@/components/custom/container";
import Link from "next/link";
import React from "react";
import { FormattedMessage } from "react-intl";

export default function FooterLanding() {
  return (
    <section className="py-10 px-20 border-t border-t-gray-200 bg-white dark:bg-gray-900 dark:border-t-gray-700">
      <Container className="">
        <div>
          <ul className="flex flex-col gap-4 md:flex-row md:gap-10 items-center justify-between">
            <li>
              <Link href="/about" className="text-gray-500 hover:text-gray-900">
                <FormattedMessage id="footer.about" />
              </Link>
            </li>

            <li>
              <Link href="/help" className="text-gray-500 hover:text-gray-900">
                <FormattedMessage id="footer.help" />
              </Link>
            </li>

            <li>
              <Link
                href="/privacy-policy"
                className="text-gray-500 hover:text-gray-900"
              >
                <FormattedMessage id="footer.privacy" />
              </Link>
            </li>

            <li>
              <Link
                href="https://youtu.be/K-_EqSy-pgI?si=JS2bOhUE_YFLsDPp"
                target="_blank"
                className="text-gray-500 hover:text-gray-900"
              >
                <FormattedMessage id="footer.youtube" />
              </Link>
            </li>
          </ul>
        </div>
      </Container>
    </section>
  );
}

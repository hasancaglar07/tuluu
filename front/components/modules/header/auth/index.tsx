"use client";

import Container from "@/components/custom/container";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import React from "react";

export default function HeaderAuth({ link }: { link?: string }) {
  const pathname = usePathname();

  return (
    <section>
      <Container fluid>
        <div className="flex justify-center md:justify-between items-center py-10 px-10">
          {/* logo */}
          <Link href={link ?? "/"} className="flex items-center gap-2">
            <X size={26} className="text-gray-400" />
          </Link>

          <Button
            variant="outline"
            size="sm"
            className="hidden md:flex items-center gap-2"
          >
            <Link
              href={pathname === "/sign-up" ? "/sign-in" : "/sign-up"}
              className="flex items-center gap-2 text-primary-500 font-bold"
            >
              {pathname === "/sign-up" ? "Sign in" : "Sign up"}
            </Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}

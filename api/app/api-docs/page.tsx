"use client";

import { getApiDocs } from "@/lib/swagger";
import * as React from "react";
import dynamic from "next/dynamic";

// Import ReactSwagger dynamically to avoid SSR issues with swagger-ui-react
const ReactSwagger = dynamic(() => import("./components/react-swagger"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading API Documentation...</div>,
});

export default function ApiDocs() {
  const spec = getApiDocs() as Record<string, unknown>;

  return (
    <section className="">
      <ReactSwagger spec={spec} />
    </section>
  );
}

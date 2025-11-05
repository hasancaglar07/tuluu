"use client";

import * as React from "react";
import dynamic from "next/dynamic";

// Import ReactSwagger dynamically to avoid SSR issues with swagger-ui-react
const ReactSwagger = dynamic(() => import("./components/react-swagger"), {
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-screen">Loading API Documentation...</div>,
});

export default function ApiDocs() {
  const [spec, setSpec] = React.useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetch("/api/public/swagger")
      .then((res) => res.json())
      .then((data) => {
        setSpec(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading API Documentation...</div>;
  }

  if (error) {
    return <div className="flex items-center justify-center h-screen text-red-500">Error: {error}</div>;
  }

  if (!spec) {
    return <div className="flex items-center justify-center h-screen">No specification found</div>;
  }

  return (
    <section className="">
      <ReactSwagger spec={spec} />
    </section>
  );
}

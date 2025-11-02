import EditSEOEntryPage from "@/components/modules/admin/seo";
import React from "react";

// Nextjs ISR caching strategy
export const revalidate = false;

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return <EditSEOEntryPage id={id} />;
}

// Nextjs dynamic metadata
export function generateMetadata() {
  return {
    title: `Page - Title here`,
    description: `Page - Description here`,
    icons: {
      icon: `path to asset file`,
    },
  };
}

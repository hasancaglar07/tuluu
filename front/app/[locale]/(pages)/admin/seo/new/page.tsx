"use client";

import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SEOFormData } from "@/types";
import SEOForm from "@/components/modules/admin/seo/seo-form";

// Page for creating a new SEO entry
export default function NewSEOEntryPage() {
  const router = useLocalizedRouter();

  // Default values for a new SEO entry
  const defaultValues: SEOFormData = {
    path: "",
    title: "",
    description: "",
    ogImage: "",
    canonicalUrl: "",
    locale: "en",
    robots: "index,follow",
    structuredData: "",
  };

  // Handle form submission to create a new SEO entry
  const handleSubmit = async (data: SEOFormData) => {
    try {
      const response = await fetch("/api/admin/seo", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create SEO entry");
      }

      // Redirect to the SEO admin page after successful creation
      router.push("/admin/seo");
      router.refresh();
    } catch (error) {
      console.error("Error creating SEO entry:", error);
      alert("Failed to create SEO entry. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New SEO Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <SEOForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isNew={true}
          />
        </CardContent>
      </Card>
    </div>
  );
}

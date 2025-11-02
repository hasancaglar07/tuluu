"use client";

import { useState, useEffect } from "react";
import { useLocalizedRouter } from "@/hooks/useLocalizedRouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SEOFormData, SEOEntry } from "@/types";
import SEOForm from "@/components/modules/admin/seo/seo-form";

// Page for editing an existing SEO entry
export default function EditSEOEntryPage({ id }: { id: string }) {
  const router = useLocalizedRouter();
  const [seoEntry, setSeoEntry] = useState<SEOEntry | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the SEO entry data when the component mounts
  useEffect(() => {
    const fetchSEOEntry = async () => {
      try {
        const response = await fetch(`/api/admin/seo/${id}`);

        if (!response.ok) {
          throw new Error("Failed to fetch SEO entry");
        }

        const data = await response.json();
        setSeoEntry(data);
      } catch (error) {
        console.error("Error fetching SEO entry:", error);
        setError("Failed to load SEO entry. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchSEOEntry();
  }, [id]);

  // Handle form submission to update the SEO entry
  const handleSubmit = async (data: SEOFormData) => {
    try {
      const response = await fetch(`/api/admin/seo/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update SEO entry");
      }

      // Redirect to the SEO admin page after successful update
      router.push("/admin/seo");
      router.refresh();
    } catch (error) {
      console.error("Error updating SEO entry:", error);
      alert("Failed to update SEO entry. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-4">Loading SEO entry...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !seoEntry) {
    return (
      <div className="container mx-auto py-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-4 text-red-500">
              {error || "SEO entry not found"}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Convert the SEO entry to form data format
  const defaultValues: SEOFormData = {
    path: seoEntry.path,
    title: seoEntry.title,
    description: seoEntry.description || "",
    ogImage: seoEntry.ogImage || "",
    canonicalUrl: seoEntry.canonicalUrl || "",
    locale: seoEntry.locale,
    robots: seoEntry.robots || "index,follow",
    structuredData: seoEntry.structuredData || "",
  };

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Edit SEO Entry</CardTitle>
        </CardHeader>
        <CardContent>
          <SEOForm
            defaultValues={defaultValues}
            onSubmit={handleSubmit}
            isNew={false}
          />
        </CardContent>
      </Card>
    </div>
  );
}

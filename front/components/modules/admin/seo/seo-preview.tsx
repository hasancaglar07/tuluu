"use client";

import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

// Props for the SEO preview component
interface SEOPreviewProps {
  title: string;
  description: string;
  path: string;
  ogImage: string;
}

// Component to preview how SEO will appear in Google search results and social media
export default function SEOPreview({
  title,
  description,
  path,
  ogImage,
}: SEOPreviewProps) {
  // Format the URL for display
  const formattedUrl = `yourdomain.com${path}`;

  // Truncate the title and description to match Google's display limits
  const truncatedTitle =
    title.length > 60 ? `${title.substring(0, 57)}...` : title;
  const truncatedDescription =
    description.length > 160
      ? `${description.substring(0, 157)}...`
      : description;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Google Search Preview</h3>
        <Card className="border border-gray-200">
          <CardContent className="p-4">
            <div className="max-w-3xl">
              <div className="text-blue-600 text-xl font-medium mb-1">
                {truncatedTitle}
              </div>
              <div className="text-green-700 text-sm mb-1">{formattedUrl}</div>
              <div className="text-gray-600 text-sm">
                {truncatedDescription ||
                  "No description provided. Add a description to improve SEO."}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {ogImage && (
        <div>
          <h3 className="text-lg font-medium mb-2">Social Media Preview</h3>
          <Card className="border border-gray-200">
            <CardContent className="p-4">
              <div className="max-w-md">
                <div
                  className="rounded-md overflow-hidden mb-2 bg-gray-100 relative"
                  style={{ height: "200px" }}
                >
                  <Image
                    src={ogImage || "/placeholder.svg"}
                    alt="Open Graph preview"
                    fill
                    style={{ objectFit: "cover" }}
                    onError={(e) => {
                      // Handle image loading errors
                      const target = e.target as HTMLImageElement;
                      target.src = "/placeholder.svg?height=200&width=400";
                    }}
                  />
                </div>
                <div className="text-gray-500 text-xs mb-1">{formattedUrl}</div>
                <div className="text-gray-900 font-medium mb-1">
                  {truncatedTitle}
                </div>
                <div className="text-gray-600 text-sm">
                  {truncatedDescription || "No description provided."}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="text-sm text-gray-500 mt-4">
        <p>
          <strong>Note:</strong> This is a simplified preview. Actual appearance
          may vary across different platforms and devices.
        </p>
      </div>
    </div>
  );
}

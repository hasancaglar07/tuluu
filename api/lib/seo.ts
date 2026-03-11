import type { Metadata } from "next";
import connectDB from "./db/connect";
import { SEO } from "@/models/Seo";

// Interface for SEO data
export interface SEOData {
  title: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
  robots?: string;
  structuredData?: string;
}

/**
 * Get SEO data for a specific path and locale
 * @param path - The URL path
 * @param locale - The locale (default: 'tr')
 * @returns SEO data for the page
 */
export async function getSEOData(
  path: string,
  locale = "tr"
): Promise<SEOData | null> {
  try {
    await connectDB();

    // Find SEO entry for the given path and locale
    const seoEntry = await SEO.findOne({ path, locale });

    if (!seoEntry) {
      return null;
    }

    return {
      title: seoEntry.title,
      description: seoEntry.description,
      ogImage: seoEntry.ogImage,
      canonicalUrl: seoEntry.canonicalUrl,
      robots: seoEntry.robots,
      structuredData: seoEntry.structuredData,
    };
  } catch (error) {
    console.error("Error fetching SEO data:", error);
    return null;
  }
}

/**
 * Generate Next.js Metadata object from SEO data
 * @param seoData - The SEO data
 * @param defaultTitle - Default title to use if SEO data is not available
 * @param defaultDescription - Default description to use if SEO data is not available
 * @returns Next.js Metadata object
 */
export function generateMetadata(
  seoData: SEOData | null,
  defaultTitle = "TULU",
  defaultDescription = "TULU ile dil öğrenmeyi eğlenceli ve etkili hale getirin."
): Metadata {
  if (!seoData) {
    return {
      title: defaultTitle,
      description: defaultDescription,
    };
  }

  const metadata: Metadata = {
    title: seoData.title,
    description: seoData.description,
  };

  // Add Open Graph image if available
  if (seoData.ogImage) {
    metadata.openGraph = {
      images: [seoData.ogImage],
    };
  }

  // Add canonical URL if available
  if (seoData.canonicalUrl) {
    metadata.alternates = {
      canonical: seoData.canonicalUrl,
    };
  }

  // Add robots directives if available
  if (seoData.robots) {
    metadata.robots = seoData.robots;
  }

  return metadata;
}

/**
 * Get structured data for a specific path and locale
 * @param path - The URL path
 * @param locale - The locale (default: 'tr')
 * @returns Structured data as a JavaScript object or null
 */
export async function getStructuredData(
  path: string,
  locale = "tr"
): Promise<Record<string, unknown> | null> {
  try {
    const seoData = await getSEOData(path, locale);

    if (!seoData?.structuredData) {
      return null;
    }

    return JSON.parse(seoData.structuredData);
  } catch (error) {
    console.error("Error parsing structured data:", error);
    return null;
  }
}

/**
 * Auto-generate default SEO data for a new page
 * @param path - The URL path
 * @param locale - The locale (default: 'tr')
 * @param siteName - The name of the site
 * @returns Default SEO data for the page
 */
export function generateDefaultSEO(
  path: string,
  // locale = "tr",
  siteName = "TULU"
): SEOData {
  // Convert path to title case
  const pathWithoutSlashes = path.replace(/^\/|\/$/g, "");
  const segments = pathWithoutSlashes.split("/");
  const lastSegment = segments[segments.length - 1] || "Ana Sayfa";

  // Convert kebab-case or snake_case to Title Case
  const title = lastSegment
    .replace(/-|_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    title: `${title} | ${siteName}`,
    description: `${siteName} üzerinde ${title.toLowerCase()} hakkında daha fazla bilgi edinin.`,
    robots: "index,follow",
  };
}

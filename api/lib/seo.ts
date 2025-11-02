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
 * @param locale - The locale (default: 'en')
 * @returns SEO data for the page
 */
export async function getSEOData(
  path: string,
  locale = "en"
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
  defaultTitle = "Your Site",
  defaultDescription = "Your site description"
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
 * @param locale - The locale (default: 'en')
 * @returns Structured data as a JavaScript object or null
 */
export async function getStructuredData(
  path: string,
  locale = "en"
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
 * @param locale - The locale (default: 'en')
 * @param siteName - The name of the site
 * @returns Default SEO data for the page
 */
export function generateDefaultSEO(
  path: string,
  // locale = "en",
  siteName = "Your Site"
): SEOData {
  // Convert path to title case
  const pathWithoutSlashes = path.replace(/^\/|\/$/g, "");
  const segments = pathWithoutSlashes.split("/");
  const lastSegment = segments[segments.length - 1] || "Home";

  // Convert kebab-case or snake_case to Title Case
  const title = lastSegment
    .replace(/-|_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());

  return {
    title: `${title} | ${siteName}`,
    description: `Learn more about ${title.toLowerCase()} on ${siteName}.`,
    robots: "index,follow",
  };
}

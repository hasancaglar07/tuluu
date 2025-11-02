import mongoose, { Schema, type Document } from "mongoose";

// Interface for SEO document in MongoDB
export interface SEODocument extends Document {
  path: string;
  title: string;
  description?: string;
  ogImage?: string;
  canonicalUrl?: string;
  locale: string;
  robots?: string;
  structuredData?: string;
  createdAt: Date;
  lastModified: Date;
}

// Schema for SEO entries
const SEOSchema = new Schema<SEODocument>(
  {
    // The URL path of the page (e.g., /about-us)
    path: {
      type: String,
      required: true,
      trim: true,
    },

    // The meta title for the page
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // The meta description for the page
    description: {
      type: String,
      trim: true,
    },

    // URL to the Open Graph image for social media sharing
    ogImage: {
      type: String,
      trim: true,
    },

    // The canonical URL for the page
    canonicalUrl: {
      type: String,
      trim: true,
    },

    // The language/locale for the page (e.g., en, es, fr)
    locale: {
      type: String,
      required: true,
      default: "en",
    },

    // Robots directives (e.g., index,follow, noindex,follow)
    robots: {
      type: String,
      default: "index,follow",
    },

    // JSON-LD structured data for rich search results
    structuredData: {
      type: String,
      trim: true,
    },

    // When the SEO entry was created
    createdAt: {
      type: Date,
      default: Date.now,
    },

    // When the SEO entry was last modified
    lastModified: {
      type: Date,
      default: Date.now,
    },
  },
  {
    // Add timestamps for createdAt and updatedAt
    timestamps: { createdAt: "createdAt", updatedAt: "lastModified" },
  }
);

// Create a compound index for path and locale to ensure uniqueness
SEOSchema.index({ path: 1, locale: 1 }, { unique: true });

// Export the SEO model
export const SEO =
  mongoose.models.SEO || mongoose.model<SEODocument>("SEO", SEOSchema);

import { NextResponse } from "next/server";

import { generateDefaultSEO } from "@/lib/seo";
import connectDB from "@/lib/db/connect";
import { SEO } from "@/models/Seo";

/**
 * @swagger
 * /api/seo:
 *   get:
 *     tags:
 *       - SEO
 *     summary: Get SEO data for a specific path and locale
 *     description: Retrieves SEO data for a specific path and locale, or generates default SEO data if none exists
 *     parameters:
 *       - in: query
 *         name: path
 *         required: true
 *         schema:
 *           type: string
 *         description: The URL path to get SEO data for
 *       - in: query
 *         name: locale
 *         schema:
 *           type: string
 *           default: en
 *         description: The locale to get SEO data for
 *     responses:
 *       200:
 *         description: SEO data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 path:
 *                   type: string
 *                 title:
 *                   type: string
 *                 description:
 *                   type: string
 *                 ogImage:
 *                   type: string
 *                 canonicalUrl:
 *                   type: string
 *                 locale:
 *                   type: string
 *                 robots:
 *                   type: string
 *                 structuredData:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 lastModified:
 *                   type: string
 *                   format: date-time
 *       400:
 *         description: Bad request - Missing path parameter
 *       500:
 *         description: Internal server error
 */
// GET handler to fetch SEO data for a specific path and locale
export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const path = url.searchParams.get("path");
    const locale = url.searchParams.get("locale") || "en";

    if (!path) {
      return NextResponse.json(
        { message: "Path parameter is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find SEO entry for the given path and locale
    let seoEntry = await SEO.findOne({ path, locale });

    // If no entry exists, generate default SEO data
    if (!seoEntry) {
      const defaultSEO = generateDefaultSEO(path, locale);

      // Create a new SEO entry with default data
      seoEntry = new SEO({
        path,
        locale,
        title: defaultSEO.title,
        description: defaultSEO.description,
        robots: defaultSEO.robots,
        createdAt: new Date(),
        lastModified: new Date(),
      });

      await seoEntry.save();
    }

    return NextResponse.json(seoEntry);
  } catch (error) {
    console.error("Error fetching SEO data:", error);
    return NextResponse.json(
      { message: "Failed to fetch SEO data" },
      { status: 500 }
    );
  }
}

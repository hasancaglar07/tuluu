import { NextResponse } from "next/server";
import { handleUpload } from "@vercel/blob/client";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = await handleUpload({
      token: process.env.BLOB_READ_WRITE_TOKEN,
      request: req,
      body,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: [
          "image/*",
          "audio/*",
          "video/*",
          "application/octet-stream",
        ],
        maximumSizeInBytes: 500 * 1024 * 1024,
        addRandomSuffix: true,
        cacheControlMaxAge: 60 * 60 * 24 * 365,
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log("✅ Upload completed:", blob.url);
      },
    });
    return NextResponse.json(result);
  } catch (err) {
    console.error("Failed to handle upload", err);
    return NextResponse.json({ error: "failed_to_generate" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

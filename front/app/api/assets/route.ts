import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const kind = (searchParams.get("kind") || "image").toLowerCase();
    const base = process.cwd();
    let dir = "images";
    if (kind === "audio") dir = "sounds";
    if (kind === "video") dir = "videos";
    const pub = path.join(base, "public", dir);
    if (!fs.existsSync(pub)) {
      return NextResponse.json({ items: [] });
    }
    const files = fs.readdirSync(pub).filter((f) => !fs.statSync(path.join(pub, f)).isDirectory());
    const items = files.map((f) => `/${dir}/${f}`);
    return NextResponse.json({ items });
  } catch (_err) {
    return NextResponse.json({ items: [] });
  }
}

export const dynamic = "force-dynamic";

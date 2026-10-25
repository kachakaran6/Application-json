import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { getGitHubConfig } from "@/lib/github";

const MIME_MAP: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp",
  ".gif": "image/gif",
};

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const slug = params.slug || [];
    const safePath = slug.map((segment) => path.basename(segment)).join("/");
    const localFilePath = path.join(process.cwd(), "images", safePath);

    const ext = path.extname(safePath).toLowerCase();
    const contentType = MIME_MAP[ext] || "application/octet-stream";

    // 1. Try reading from local filesystem
    if (fsSync.existsSync(localFilePath)) {
      const stat = await fs.stat(localFilePath);
      if (!stat.isDirectory()) {
        const fileBuffer = await fs.readFile(localFilePath);
        return new NextResponse(fileBuffer, {
          status: 200,
          headers: {
            "Content-Type": contentType,
            "Cache-Control": "public, max-age=31536000, immutable",
          },
        });
      }
    }

    // 2. Fallback for Vercel Serverless: Stream from Raw GitHub CDN
    const { owner, repo, branch } = getGitHubConfig();
    const cdnUrl = `https://raw.githubusercontent.com/${owner}/${repo}/${branch}/images/${safePath}`;

    const cdnRes = await fetch(cdnUrl);
    if (cdnRes.ok) {
      const buffer = await cdnRes.arrayBuffer();
      return new NextResponse(Buffer.from(buffer), {
        status: 200,
        headers: {
          "Content-Type": contentType,
          "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
        },
      });
    }

    return new NextResponse("Image not found", { status: 404 });
  } catch (error) {
    return new NextResponse("Error reading file", { status: 500 });
  }
}

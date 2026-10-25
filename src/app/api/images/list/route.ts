import { NextResponse } from "next/server";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { isGitHubMode, listRepoFiles } from "@/lib/github";

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), "images");
    let imageFiles: string[] = [];
    const validExts = [".png", ".jpg", ".jpeg", ".svg", ".ico", ".webp", ".gif"];

    if (fsSync.existsSync(imagesDir)) {
      try {
        const files = await fs.readdir(imagesDir);
        imageFiles = files.filter((f) => validExts.includes(path.extname(f).toLowerCase()));
      } catch {}
    }

    // If on Vercel and no local files found, fetch from GitHub repo
    if (imageFiles.length === 0 && isGitHubMode()) {
      const repoFiles = await listRepoFiles("images");
      imageFiles = repoFiles.filter((f) => validExts.includes(path.extname(f).toLowerCase()));
    }

    const images = imageFiles.map((filename) => ({
      filename,
      url: `/images/${filename}`,
      size: 0,
      updatedAt: new Date().toISOString(),
    }));

    return NextResponse.json({
      images: images.sort((a, b) => a.filename.localeCompare(b.filename)),
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to list images" }, { status: 500 });
  }
}

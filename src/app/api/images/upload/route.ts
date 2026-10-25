import { NextResponse } from "next/server";
import fs from "fs/promises";
import fsSync from "fs";
import path from "path";
import { isAuthenticated } from "@/lib/auth";
import { isGitHubMode, commitFileToGitHub } from "@/lib/github";

export async function POST(req: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized. Please authenticate as Admin." }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const MAX_SIZE = 5 * 1024 * 1024; // 5MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ error: "File exceeds 5MB size limit" }, { status: 400 });
    }

    const allowedExtensions = [".png", ".jpg", ".jpeg", ".svg", ".ico", ".webp", ".gif"];
    const ext = path.extname(file.name).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return NextResponse.json(
        { error: "Invalid file type. Allowed: PNG, JPG, JPEG, SVG, ICO, WEBP, GIF" },
        { status: 400 }
      );
    }

    // Sanitize filename to alphanumeric and hyphens/underscores
    const rawBaseName = path.basename(file.name, ext);
    const safeBaseName = rawBaseName.replace(/[^a-zA-Z0-9_-]/g, "_").toLowerCase();
    const finalName = `${safeBaseName}${ext}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // If on Vercel with GitHub Token, commit directly to images/ on the repository
    if (isGitHubMode()) {
      await commitFileToGitHub(
        `images/${finalName}`,
        buffer,
        `feat(assets): upload icon "${finalName}" via Registry Studio`
      );
    }

    // Also write locally if filesystem is writable
    try {
      const imagesDir = path.join(process.cwd(), "images");
      if (!fsSync.existsSync(imagesDir)) {
        await fs.mkdir(imagesDir, { recursive: true });
      }
      const destPath = path.join(imagesDir, finalName);
      await fs.writeFile(destPath, buffer);
    } catch (err) {
      // Ignored on read-only serverless filesystems (e.g. Vercel)
    }

    return NextResponse.json({
      success: true,
      filename: finalName,
      url: `/images/${finalName}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { listBackups, restoreBackup, createBackup } from "@/lib/registry";
import { isAuthenticated } from "@/lib/auth";

export async function GET() {
  try {
    const backups = await listBackups();
    return NextResponse.json({ backups });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to list backups" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized. Please authenticate as Admin." }, { status: 401 });
    }

    const body = await req.json();
    const { action, filename } = body;

    if (action === "create") {
      const created = await createBackup();
      return NextResponse.json({ success: true, filename: created });
    }

    if (action === "restore") {
      if (!filename || typeof filename !== "string") {
        return NextResponse.json({ error: "Filename is required to restore" }, { status: 400 });
      }
      const restoredRegistry = await restoreBackup(filename);
      return NextResponse.json({ success: true, registry: restoredRegistry });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Backup operation failed" }, { status: 500 });
  }
}

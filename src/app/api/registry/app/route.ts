import { NextResponse } from "next/server";
import { addApp, updateApp, deleteApp } from "@/lib/registry";
import { isAuthenticated } from "@/lib/auth";
import { AppItemSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized. Please authenticate as Admin." }, { status: 401 });
    }

    const body = await req.json();
    const validated = AppItemSchema.parse(body);
    const updatedRegistry = await addApp(validated);

    return NextResponse.json({ success: true, registry: updatedRegistry, item: validated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create application" },
      { status: 400 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized. Please authenticate as Admin." }, { status: 401 });
    }

    const body = await req.json();
    const { originalId, ...appData } = body;

    if (!originalId || typeof originalId !== "string") {
      return NextResponse.json({ error: "originalId is required for updates" }, { status: 400 });
    }

    const validated = AppItemSchema.parse(appData);
    const updatedRegistry = await updateApp(originalId, validated);

    return NextResponse.json({ success: true, registry: updatedRegistry, item: validated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update application" },
      { status: 400 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized. Please authenticate as Admin." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "App ID is required" }, { status: 400 });
    }

    const updatedRegistry = await deleteApp(id);
    return NextResponse.json({ success: true, registry: updatedRegistry, deletedId: id });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete application" },
      { status: 400 }
    );
  }
}

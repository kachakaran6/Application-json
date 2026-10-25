import { NextResponse } from "next/server";
import { addWebsite, updateWebsite, deleteWebsite } from "@/lib/registry";
import { isAuthenticated } from "@/lib/auth";
import { WebsiteItemSchema } from "@/lib/schemas";

export async function POST(req: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized. Please authenticate as Admin." }, { status: 401 });
    }

    const body = await req.json();
    const validated = WebsiteItemSchema.parse(body);
    const updatedRegistry = await addWebsite(validated);

    return NextResponse.json({ success: true, registry: updatedRegistry, item: validated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to create website" },
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
    const { originalId, ...webData } = body;

    if (!originalId || typeof originalId !== "string") {
      return NextResponse.json({ error: "originalId is required for updates" }, { status: 400 });
    }

    const validated = WebsiteItemSchema.parse(webData);
    const updatedRegistry = await updateWebsite(originalId, validated);

    return NextResponse.json({ success: true, registry: updatedRegistry, item: validated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to update website" },
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
      return NextResponse.json({ error: "Website ID is required" }, { status: 400 });
    }

    const updatedRegistry = await deleteWebsite(id);
    return NextResponse.json({ success: true, registry: updatedRegistry, deletedId: id });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to delete website" },
      { status: 400 }
    );
  }
}

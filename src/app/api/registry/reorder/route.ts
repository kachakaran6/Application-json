import { NextResponse } from "next/server";
import { reorderApps, reorderWebsites } from "@/lib/registry";
import { isAuthenticated } from "@/lib/auth";
import { z } from "zod";
import { AppItemSchema, WebsiteItemSchema } from "@/lib/schemas";

const ReorderSchema = z.object({
  type: z.enum(["apps", "websites"]),
  items: z.array(z.any()),
});

export async function POST(req: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized. Please authenticate as Admin." }, { status: 401 });
    }

    const body = await req.json();
    const { type, items } = ReorderSchema.parse(body);

    if (type === "apps") {
      const parsedApps = z.array(AppItemSchema).parse(items);
      const updatedRegistry = await reorderApps(parsedApps);
      return NextResponse.json({ success: true, registry: updatedRegistry });
    } else {
      const parsedWebsites = z.array(WebsiteItemSchema).parse(items);
      const updatedRegistry = await reorderWebsites(parsedWebsites);
      return NextResponse.json({ success: true, registry: updatedRegistry });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to reorder items" },
      { status: 400 }
    );
  }
}

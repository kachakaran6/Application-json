import { NextResponse } from "next/server";
import { getRegistryData, saveRegistryData } from "@/lib/registry";
import { isAuthenticated } from "@/lib/auth";
import { RegistrySchema } from "@/lib/schemas";

export async function GET() {
  try {
    const data = await getRegistryData();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to load registry" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authed = await isAuthenticated();
    if (!authed) {
      return NextResponse.json({ error: "Unauthorized. Please authenticate as Admin." }, { status: 401 });
    }

    const body = await req.json();
    const validated = RegistrySchema.parse(body);
    await saveRegistryData(validated);

    return NextResponse.json({ success: true, data: validated });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save registry" },
      { status: 400 }
    );
  }
}

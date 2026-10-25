import { NextResponse } from "next/server";
import { getCookieName } from "@/lib/auth";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out" });
  response.cookies.delete(getCookieName());
  return response;
}

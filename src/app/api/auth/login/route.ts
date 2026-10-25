import { NextResponse } from "next/server";
import { createSessionToken, verifyAdminPassword, getCookieName } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    if (!verifyAdminPassword(password)) {
      return NextResponse.json({ error: "Invalid master password" }, { status: 401 });
    }

    const token = await createSessionToken("admin");
    const response = NextResponse.json({ success: true, message: "Logged in successfully" });

    response.cookies.set({
      name: getCookieName(),
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}

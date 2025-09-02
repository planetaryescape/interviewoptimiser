import { generateCSRFToken, setCSRFCookie } from "@/lib/csrf";
import { NextResponse } from "next/server";

export async function GET() {
  const token = await generateCSRFToken();
  await setCSRFCookie(token);

  return NextResponse.json({ message: "CSRF token set" }, { status: 200 });
}

import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/admin-auth";
import { siteContent } from "@/data/content";
import { loadData, saveData } from "@/lib/storage";
import { validateContent } from "@/lib/validation";

export async function GET(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await loadData("content", siteContent));
}

export async function POST(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let content: unknown;
  try {
    content = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const err = validateContent(content);
  if (err) {
    return NextResponse.json({ error: err }, { status: 400 });
  }
  await saveData("content", content);
  return NextResponse.json({ success: true });
}

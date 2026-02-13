import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/admin-auth";
import { siteContent } from "@/data/content";
import { loadData, saveData } from "@/lib/storage";

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
  const content = await request.json();
  await saveData("content", content);
  return NextResponse.json({ success: true });
}

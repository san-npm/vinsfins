import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/admin-auth";
import { wines } from "@/data/wines";
import { loadData, saveData } from "@/lib/storage";

export async function GET(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await loadData("wines", wines));
}

export async function POST(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await request.json();
  await saveData("wines", items);
  return NextResponse.json({ success: true });
}

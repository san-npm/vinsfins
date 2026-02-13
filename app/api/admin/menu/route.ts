import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/admin-auth";
import { menuItems } from "@/data/menu";
import { loadData, saveData } from "@/lib/storage";

export async function GET(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await loadData("menu", menuItems));
}

export async function POST(request: NextRequest) {
  if (!verifyToken(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await request.json();
  await saveData("menu", items);
  return NextResponse.json({ success: true });
}

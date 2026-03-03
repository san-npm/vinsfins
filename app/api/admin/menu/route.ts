import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/admin-auth";
import { menuItems } from "@/data/menu";
import { loadData, saveData } from "@/lib/storage";
import { validateMenu } from "@/lib/validation";

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
  let items: unknown;
  try {
    items = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const err = validateMenu(items);
  if (err) {
    return NextResponse.json({ error: err }, { status: 400 });
  }
  await saveData("menu", items);
  return NextResponse.json({ success: true });
}

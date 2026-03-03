import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/admin-auth";
import { wines } from "@/data/wines";
import { loadData, saveData } from "@/lib/storage";
import { validateWines } from "@/lib/validation";

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
  let items: unknown;
  try {
    items = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const err = validateWines(items);
  if (err) {
    return NextResponse.json({ error: err }, { status: 400 });
  }
  await saveData("wines", items);
  return NextResponse.json({ success: true });
}

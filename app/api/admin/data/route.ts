import { NextRequest, NextResponse } from "next/server";
import { menuItems } from "@/data/menu";
import { wines } from "@/data/wines";
import { siteContent } from "@/data/content";
import { loadData, saveData } from "@/lib/storage";
import { verifyToken } from "@/lib/admin-auth";
import { validateWines, validateMenu, validateContent } from "@/lib/validation";

export async function GET(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const type = req.nextUrl.searchParams.get("type");
  if (type === "menu") return NextResponse.json(await loadData("menu", menuItems));
  if (type === "wines") return NextResponse.json(await loadData("wines", wines));
  if (type === "content") return NextResponse.json(await loadData("content", siteContent));
  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { type?: string; data?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const { type, data } = body;

  if (type === "menu") {
    const err = validateMenu(data);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    await saveData("menu", data);
    return NextResponse.json({ ok: true });
  }
  if (type === "wines") {
    const err = validateWines(data);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    await saveData("wines", data);
    return NextResponse.json({ ok: true });
  }
  if (type === "content") {
    const err = validateContent(data);
    if (err) return NextResponse.json({ error: err }, { status: 400 });
    await saveData("content", data);
    return NextResponse.json({ ok: true });
  }
  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

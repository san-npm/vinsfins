import { NextRequest, NextResponse } from "next/server";
import { menuItems } from "@/data/menu";
import { wines } from "@/data/wines";
import { siteContent } from "@/data/content";
import { loadData, saveData } from "@/lib/storage";
import { verifyToken } from "@/lib/admin-auth";

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
  const { type, data } = await req.json();
  if (type === "menu") { await saveData("menu", data); return NextResponse.json({ ok: true }); }
  if (type === "wines") { await saveData("wines", data); return NextResponse.json({ ok: true }); }
  if (type === "content") { await saveData("content", data); return NextResponse.json({ ok: true }); }
  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

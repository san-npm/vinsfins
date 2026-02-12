import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { menuItems } from "@/data/menu";
import { wines } from "@/data/wines";

const DATA_DIR = join(process.cwd(), ".data");

async function ensureDir() {
  try { await mkdir(DATA_DIR, { recursive: true }); } catch {}
}

async function loadJSON(file: string, fallback: unknown) {
  try {
    const raw = await readFile(join(DATA_DIR, file), "utf-8");
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

async function saveJSON(file: string, data: unknown) {
  await ensureDir();
  await writeFile(join(DATA_DIR, file), JSON.stringify(data, null, 2), "utf-8");
}

function checkAuth(req: NextRequest): boolean {
  const auth = req.headers.get("authorization");
  return !!auth && auth.startsWith("Bearer ") && auth.length > 10;
}

export async function GET(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const type = req.nextUrl.searchParams.get("type");
  if (type === "menu") return NextResponse.json(await loadJSON("menu.json", menuItems));
  if (type === "wines") return NextResponse.json(await loadJSON("wines.json", wines));
  if (type === "content") return NextResponse.json(await loadJSON("content.json", {}));
  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  if (!checkAuth(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { type, data } = await req.json();
  if (type === "menu") { await saveJSON("menu.json", data); return NextResponse.json({ ok: true }); }
  if (type === "wines") { await saveJSON("wines.json", data); return NextResponse.json({ ok: true }); }
  if (type === "content") { await saveJSON("content.json", data); return NextResponse.json({ ok: true }); }
  return NextResponse.json({ error: "Invalid type" }, { status: 400 });
}

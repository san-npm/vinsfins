import { NextResponse } from "next/server";
import { wines } from "@/data/wines";
import { loadData } from "@/lib/storage";

export async function GET() {
  return NextResponse.json(await loadData("wines", wines));
}

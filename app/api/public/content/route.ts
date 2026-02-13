import { NextResponse } from "next/server";
import { siteContent } from "@/data/content";
import { loadData } from "@/lib/storage";

export async function GET() {
  return NextResponse.json(await loadData("content", siteContent));
}

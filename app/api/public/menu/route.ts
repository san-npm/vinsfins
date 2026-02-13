import { NextResponse } from "next/server";
import { menuItems } from "@/data/menu";
import { loadData } from "@/lib/storage";

export async function GET() {
  return NextResponse.json(await loadData("menu", menuItems));
}

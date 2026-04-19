import { NextResponse } from "next/server";
import { menuItems } from "@/data/menu";
import { loadData } from "@/lib/storage";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  return NextResponse.json(await loadData("menu", menuItems));
}

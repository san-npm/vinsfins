import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/admin-auth";
import {
  listFailedEmails,
  getFailedEmail,
  deleteFailedEmail,
  markFailedEmailRetried,
} from "@/lib/email-queue";
import { retrySendEmail } from "@/lib/email";

export async function GET(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const items = await listFailedEmails(200);
  const sanitized = items.map(({ html: _html, ...rest }) => rest);
  return NextResponse.json({ items: sanitized });
}

export async function POST(req: NextRequest) {
  if (!verifyToken(req)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body: { id?: string; action?: "retry" | "delete" };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const { id, action } = body;
  if (!id || (action !== "retry" && action !== "delete")) {
    return NextResponse.json({ error: "id and action=retry|delete required" }, { status: 400 });
  }

  if (action === "delete") {
    await deleteFailedEmail(id);
    return NextResponse.json({ ok: true });
  }

  const entry = await getFailedEmail(id);
  if (!entry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const result = await retrySendEmail({ to: entry.to, subject: entry.subject, html: entry.html });
  if (result.ok) {
    await deleteFailedEmail(id);
    return NextResponse.json({ ok: true });
  }
  await markFailedEmailRetried(id, result.error ?? "unknown error");
  return NextResponse.json({ ok: false, error: result.error }, { status: 502 });
}

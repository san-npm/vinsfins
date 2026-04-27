import { kv } from "@vercel/kv";

export interface FailedEmail {
  id: string;
  to: string;
  from: string;
  subject: string;
  html: string;
  sessionId: string;
  errorMessage: string;
  createdAt: number;
  attempts: number;
  lastAttemptAt: number;
}

const QUEUE_KEY = "failed_emails:queue";
const ENTRY_PREFIX = "failed_email:";
const TTL_SECONDS = 30 * 24 * 60 * 60;

function entryKey(id: string): string {
  return `${ENTRY_PREFIX}${id}`;
}

export async function enqueueFailedEmail(input: {
  to: string;
  from: string;
  subject: string;
  html: string;
  sessionId: string;
  kind: "customer" | "admin";
  errorMessage: string;
}): Promise<void> {
  const id = `${input.sessionId}:${input.kind}`;
  const now = Date.now();
  const record: FailedEmail = {
    id,
    to: input.to,
    from: input.from,
    subject: input.subject,
    html: input.html,
    sessionId: input.sessionId,
    errorMessage: input.errorMessage,
    createdAt: now,
    attempts: 1,
    lastAttemptAt: now,
  };
  await kv.set(entryKey(id), record, { ex: TTL_SECONDS });
  await kv.zadd(QUEUE_KEY, { score: now, member: id });
}

export async function listFailedEmails(limit = 100): Promise<FailedEmail[]> {
  const ids = (await kv.zrange<string[]>(QUEUE_KEY, 0, limit - 1, { rev: true })) ?? [];
  if (ids.length === 0) return [];
  const records = await Promise.all(ids.map((id) => kv.get<FailedEmail>(entryKey(id))));
  // Lazy tombstone cleanup: per-record entries TTL out after 30 days, but
  // zset members would otherwise live forever and inflate the count plus
  // push live failures off the first page over time.
  const stale: string[] = [];
  const live: FailedEmail[] = [];
  records.forEach((r, i) => {
    if (r === null) stale.push(ids[i]);
    else live.push(r);
  });
  if (stale.length > 0) {
    await kv.zrem(QUEUE_KEY, ...stale).catch(() => { /* best effort */ });
  }
  return live;
}

export async function getFailedEmail(id: string): Promise<FailedEmail | null> {
  return (await kv.get<FailedEmail>(entryKey(id))) ?? null;
}

export async function deleteFailedEmail(id: string): Promise<void> {
  await kv.del(entryKey(id));
  await kv.zrem(QUEUE_KEY, id);
}

export async function markFailedEmailRetried(id: string, errorMessage: string): Promise<void> {
  const existing = await getFailedEmail(id);
  if (!existing) return;
  const now = Date.now();
  const updated: FailedEmail = {
    ...existing,
    errorMessage,
    attempts: existing.attempts + 1,
    lastAttemptAt: now,
  };
  await kv.set(entryKey(id), updated, { ex: TTL_SECONDS });
}

export async function failedEmailsCount(): Promise<number> {
  return (await kv.zcard(QUEUE_KEY)) ?? 0;
}

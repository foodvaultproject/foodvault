import { Redis } from "@upstash/redis";
import type { AuthEmailKind } from "@/lib/auth/bot-protection/types";

const DEDUP_WINDOW_MS = 5 * 60 * 1000;

type MemoryEntry = {
  sentAt: number;
};

const memoryDedup = new Map<string, MemoryEntry>();

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = getRedisClient();

function dedupKey(kind: AuthEmailKind, email: string) {
  return `fv-auth-email:${kind}:${email.trim().toLowerCase()}`;
}

function checkMemoryDedup(kind: AuthEmailKind, email: string) {
  const key = dedupKey(kind, email);
  const existing = memoryDedup.get(key);
  const now = Date.now();

  if (existing && now - existing.sentAt < DEDUP_WINDOW_MS) {
    return { duplicate: true as const };
  }

  memoryDedup.set(key, { sentAt: now });
  return { duplicate: false as const };
}

export async function reserveAuthEmailSend(kind: AuthEmailKind, email: string) {
  const normalized = email.trim().toLowerCase();
  if (!normalized) {
    return { allowed: false as const, duplicate: false as const };
  }

  if (!redis) {
    const memory = checkMemoryDedup(kind, normalized);
    return memory.duplicate
      ? { allowed: false as const, duplicate: true as const }
      : { allowed: true as const, duplicate: false as const };
  }

  const key = dedupKey(kind, normalized);
  const reserved = await redis.set(key, Date.now(), {
    nx: true,
    ex: Math.floor(DEDUP_WINDOW_MS / 1000),
  });

  if (reserved === null) {
    return { allowed: false as const, duplicate: true as const };
  }

  return { allowed: true as const, duplicate: false as const };
}

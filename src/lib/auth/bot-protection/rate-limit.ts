import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import {
  authRateLimitMessage,
  type AuthRateLimitAction,
} from "@/lib/auth/bot-protection/types";

const WINDOW_MS = 60 * 1000;

type MemoryBucket = {
  count: number;
  resetAt: number;
};

export type RateLimitDecision =
  | { allowed: true }
  | {
      allowed: false;
      error: string;
      retryAfterSeconds: number;
      resetAt: number;
    };

const memoryBuckets = new Map<string, MemoryBucket>();

const LIMITS: Record<
  AuthRateLimitAction,
  { max: number; window: `${number} m` | `${number} s` }
> = {
  password_reset: { max: 30, window: "1 m" },
  email_verification: { max: 30, window: "1 m" },
  signup: { max: 30, window: "1 m" },
  login: { max: 30, window: "1 m" },
};

function getRedisClient() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

const redis = getRedisClient();

const upstashLimiters = redis
  ? (Object.fromEntries(
      (Object.entries(LIMITS) as [AuthRateLimitAction, (typeof LIMITS)[AuthRateLimitAction]][]).map(
        ([action, config]) => [
          action,
          new Ratelimit({
            redis,
            limiter: Ratelimit.slidingWindow(config.max, config.window),
            prefix: `fv-auth:v2:${action}`,
            analytics: false,
          }),
        ]
      )
    ) as Record<AuthRateLimitAction, Ratelimit>)
  : null;

function allowlistedIps() {
  return (process.env.ALLOWLISTED_IPS ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function isAllowlistedIp(ip: string) {
  const normalized = ip.trim();
  if (!normalized || normalized === "unknown") return false;
  return allowlistedIps().includes(normalized);
}

function retryAfterSeconds(resetAtMs: number) {
  return Math.max(1, Math.ceil((resetAtMs - Date.now()) / 1000));
}

function denied(resetAtMs: number): RateLimitDecision {
  const seconds = retryAfterSeconds(resetAtMs);
  return {
    allowed: false,
    retryAfterSeconds: seconds,
    resetAt: Math.ceil(resetAtMs / 1000),
    error: authRateLimitMessage(seconds),
  };
}

function checkMemoryRateLimit(action: AuthRateLimitAction, ip: string): RateLimitDecision {
  const key = `${action}:${ip}`;
  const limit = LIMITS[action].max;
  const now = Date.now();
  const bucket = memoryBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true };
  }

  if (bucket.count >= limit) {
    return denied(bucket.resetAt);
  }

  bucket.count += 1;
  memoryBuckets.set(key, bucket);
  return { allowed: true };
}

/** Values for X-RateLimit-Reset (unix seconds) and Retry-After. */
export function rateLimitHeaders(resetAtSeconds: number, retryAfterSeconds: number) {
  return {
    "X-RateLimit-Limit": String(LIMITS.login.max),
    "X-RateLimit-Reset": String(resetAtSeconds),
    "Retry-After": String(retryAfterSeconds),
  };
}

export async function checkAuthRateLimit(
  action: AuthRateLimitAction,
  ip: string
): Promise<RateLimitDecision> {
  if (process.env.NODE_ENV !== "production") {
    return { allowed: true };
  }

  if (isAllowlistedIp(ip)) {
    return { allowed: true };
  }

  const limiter = upstashLimiters?.[action];
  if (!limiter) {
    return checkMemoryRateLimit(action, ip);
  }

  const result = await limiter.limit(ip);
  if (!result.success) {
    return denied(result.reset);
  }

  return { allowed: true };
}

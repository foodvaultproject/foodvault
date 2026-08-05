import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { AuthRateLimitAction } from "@/lib/auth/bot-protection/types";
import { AUTH_RATE_LIMIT_MESSAGE } from "@/lib/auth/bot-protection/types";

const FIFTEEN_MINUTES_MS = 15 * 60 * 1000;

type MemoryBucket = {
  count: number;
  resetAt: number;
};

const memoryBuckets = new Map<string, MemoryBucket>();

const LIMITS: Record<
  AuthRateLimitAction,
  { max: number; window: `${number} m` | `${number} s` }
> = {
  password_reset: { max: 3, window: "15 m" },
  email_verification: { max: 3, window: "15 m" },
  signup: { max: 5, window: "15 m" },
  login: { max: 10, window: "15 m" },
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
            prefix: `fv-auth:${action}`,
          }),
        ]
      )
    ) as Record<AuthRateLimitAction, Ratelimit>)
  : null;

function checkMemoryRateLimit(action: AuthRateLimitAction, ip: string) {
  const key = `${action}:${ip}`;
  const limit = LIMITS[action].max;
  const now = Date.now();
  const bucket = memoryBuckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    memoryBuckets.set(key, { count: 1, resetAt: now + FIFTEEN_MINUTES_MS });
    return { allowed: true as const };
  }

  if (bucket.count >= limit) {
    return { allowed: false as const, error: AUTH_RATE_LIMIT_MESSAGE };
  }

  bucket.count += 1;
  memoryBuckets.set(key, bucket);
  return { allowed: true as const };
}

export async function checkAuthRateLimit(action: AuthRateLimitAction, ip: string) {
  const limiter = upstashLimiters?.[action];
  if (!limiter) {
    return checkMemoryRateLimit(action, ip);
  }

  const result = await limiter.limit(ip);
  if (!result.success) {
    return { allowed: false as const, error: AUTH_RATE_LIMIT_MESSAGE };
  }

  return { allowed: true as const };
}

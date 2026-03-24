interface CacheLikeClient {
  get: (key: string) => Promise<string | null>;
  set: (key: string, value: string, options?: { EX?: number }) => Promise<unknown>;
}

const memoryCache = new Map<string, { value: string; expiresAt: number }>();
let redisClientPromise: Promise<CacheLikeClient | null> | null = null;

async function getRedisClient(): Promise<CacheLikeClient | null> {
  if (!process.env.REDIS_URL) {
    return null;
  }

  if (!redisClientPromise) {
    redisClientPromise = (async () => {
      try {
        const redisModule = await import('redis');
        const client = redisModule.createClient({ url: process.env.REDIS_URL });
        client.on('error', () => undefined);
        await client.connect();
        return client as unknown as CacheLikeClient;
      } catch {
        return null;
      }
    })();
  }

  return redisClientPromise;
}

export async function getCached<T>(key: string): Promise<T | null> {
  const redis = await getRedisClient();

  if (redis) {
    const value = await redis.get(key);
    return value ? (JSON.parse(value) as T) : null;
  }

  const entry = memoryCache.get(key);
  if (!entry) {
    return null;
  }

  if (Date.now() > entry.expiresAt) {
    memoryCache.delete(key);
    return null;
  }

  return JSON.parse(entry.value) as T;
}

export async function setCached<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
  const payload = JSON.stringify(value);
  const redis = await getRedisClient();

  if (redis) {
    await redis.set(key, payload, { EX: ttlSeconds });
    return;
  }

  memoryCache.set(key, {
    value: payload,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export async function withCache<T>(
  key: string,
  ttlSeconds: number,
  resolver: () => Promise<T>,
): Promise<T> {
  const cached = await getCached<T>(key);
  if (cached !== null) {
    return cached;
  }

  const value = await resolver();
  await setCached(key, value, ttlSeconds);

  return value;
}

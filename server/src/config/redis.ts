import { createClient, RedisClientType } from 'redis';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Lazy Redis client — only created when REDIS_URL is provided.
 * This prevents a crash on cold-start in environments where Redis
 * is not configured (e.g. the Vercel function before Redis is set up).
 */
let redisClient: ReturnType<typeof createClient> | null = null;

if (process.env.REDIS_URL) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    redisClient.on('error', (err) => console.error('Redis Client Error', err));
}

export const connectRedis = async (): Promise<void> => {
    if (!redisClient) {
        console.warn('REDIS_URL not set — Redis caching is disabled.');
        return;
    }
    if (!redisClient.isOpen) {
        try {
            await redisClient.connect();
            console.log('Redis Connected');
        } catch (err) {
            console.error('Redis connection failed (non-fatal):', err);
        }
    }
};

/**
 * Safe wrappers that silently skip if Redis is unavailable.
 * This prevents runtime crashes in routes that use Redis for caching.
 */
export const redisGet = async (key: string): Promise<string | null> => {
    if (!redisClient?.isOpen) return null;
    try { return await redisClient.get(key); } catch { return null; }
};

export const redisSetEx = async (key: string, ttl: number, value: string): Promise<void> => {
    if (!redisClient?.isOpen) return;
    try { await redisClient.setEx(key, ttl, value); } catch { /* non-fatal */ }
};

export default redisClient;

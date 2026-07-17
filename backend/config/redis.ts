import { Redis } from 'ioredis';

const REDIS_URL = process.env.REDIS_URL || 'redis://127.0.0.1:6379';

const redisClient = new Redis(REDIS_URL, {
  maxRetriesPerRequest: 3,
  enableReadyCheck: true,
  connectTimeout: 5_000,
  retryStrategy: () => 500,
});

redisClient.on('connect', () => console.log('[Redis] Connected.'));
redisClient.on('error', (error: Error) => console.error('[Redis] Connection error:', error));

export default redisClient;

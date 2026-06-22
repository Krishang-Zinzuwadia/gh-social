import { Redis } from 'ioredis';

// Connects to your local Docker Redis container on port 6379
const redisClient = new Redis(process.env.REDIS_URL || 'redis://127.0.0.1:6379');

redisClient.on('connect', () => {
  console.log('Redis engine connected smoothly!');
});

redisClient.on('error', (err: any) => {
  console.error('Redis connection error:', err);
});

export default redisClient;
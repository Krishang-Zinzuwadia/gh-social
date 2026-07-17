import 'dotenv/config';
import redisClient from './config/redis.js';
import { sqlClient } from './db/index.js';
import { ApplicationRuntime } from './runtime/applicationRuntime.js';

const role = process.env.WORKER_ROLE;
if (!role || !['outbox', 'feed', 'maintenance', 'all'].includes(role)) {
  throw new Error('WORKER_ROLE must be outbox, feed, maintenance, or all. Use separate roles in production.');
}

const runtime = new ApplicationRuntime(role as 'outbox' | 'feed' | 'maintenance' | 'all');
runtime.start();
console.log(`Backend worker running with role=${role}`);

async function shutdown(): Promise<void> {
  await runtime.supervisor.stop();
  await Promise.allSettled([redisClient.quit(), sqlClient.end({ timeout: 5 })]);
  process.exit(0);
}
process.on('SIGTERM', () => void shutdown());
process.on('SIGINT', () => void shutdown());

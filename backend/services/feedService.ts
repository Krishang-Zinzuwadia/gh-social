import redisClient from '../config/redis.js';
import { mlService, type MlRecommendationBatches } from './mlService.js';

export class FeedService {
  private SESSION_TTL = 600; // 10 minutes cache lifetime
  /** How long the in-flight lock is held before auto-expiring (ms). */
  private LOCK_TTL_MS = 30_000;
  /** Max time a waiter will poll for the lock to be released (ms). */
  private LOCK_WAIT_TIMEOUT_MS = 35_000;

  private getQueueKey(userId: string): string {
    return `user:${userId}:delivery_queue`;
  }

  private getLockKey(userId: string): string {
    return `user:${userId}:feed_generating`;
  }

  private flattenRecommendationBatches(batches: MlRecommendationBatches): unknown[] {
    return Object.keys(batches)
      .filter((key) => key.startsWith('batch_'))
      .sort()
      .flatMap((key) => {
        const batch = batches[key];
        return Array.isArray(batch) ? batch : [];
      });
  }

  /**
   * Stores ML recommendation objects in the Redis delivery queue.
   */
  async processAndCacheBatch(userId: string, recommendations: unknown[]): Promise<void> {
    const queueKey = this.getQueueKey(userId);

    try {
      if (recommendations.length === 0) {
        await redisClient.set(queueKey, '__empty__', 'EX', this.SESSION_TTL);
        return;
      }

      const pipeline = redisClient.pipeline();

      pipeline.del(queueKey);

      for (const post of recommendations) {
        pipeline.rpush(queueKey, JSON.stringify(post));
      }

      pipeline.expire(queueKey, this.SESSION_TTL);
      await pipeline.exec();

      console.log(`[FeedService] Cached ${recommendations.length} ML recommendations for User: ${userId}`);
    } catch (error) {
      console.error('[FeedService] Error caching feed batch:', error);
      throw error;
    }
  }

  /**
   * Task --> Pulls the pre-stitched feed from the Redis queue for the mobile client
   */
  async getCachedFeed(userId: string): Promise<any[] | null> {
    const queueKey = this.getQueueKey(userId);

    try {
      const type = await redisClient.type(queueKey);
      if (type === 'string') {
        const val = await redisClient.get(queueKey);
        if (val === '__empty__') return [];
      }

      const rawFeedItems = await redisClient.lrange(queueKey, 0, -1);

      if (!rawFeedItems || rawFeedItems.length === 0) {
        return null;
      }

      return rawFeedItems.map((item: string) => JSON.parse(item));
    } catch (error) {
      console.error('[FeedService] Failed to retrieve cached feed:', error);
      throw error;
    }
  }

  /**
   * Returns the cached feed if available. On a cache miss, acquires a short-lived
   * Redis lock (SET NX PX) so that only one concurrent request calls the ML service.
   * Other simultaneous requests poll with exponential back-off until the feed is
   * populated, then return the cached result — preventing duplicate ML calls.
   */
  async getOrGenerateFeed(userId: string): Promise<any[]> {
    const cachedFeed = await this.getCachedFeed(userId);
    if (cachedFeed !== null) {
      return cachedFeed;
    }

    const lockKey = this.getLockKey(userId);
    const deadline = Date.now() + this.LOCK_WAIT_TIMEOUT_MS;
    let delay = 100; // start at 100 ms, doubles each iteration (cap 2 s)

    while (Date.now() < deadline) {
      const acquired = await redisClient.set(lockKey, '1', 'PX', this.LOCK_TTL_MS, 'NX');

      if (acquired === 'OK') {
        try {
          const batches = await mlService.generateRecommendations(userId);
          const recommendations = this.flattenRecommendationBatches(batches);
          await this.processAndCacheBatch(userId, recommendations);
          return recommendations;
        } finally {
          await redisClient.del(lockKey).catch(() => {/* best-effort */});
        }
      }

      await new Promise((resolve) => setTimeout(resolve, delay));
      delay = Math.min(delay * 2, 2_000);

      const feed = await this.getCachedFeed(userId);
      if (feed !== null) {
        return feed;
      }
    }

    throw new Error(`[FeedService] Timeout waiting for feed generation for user ${userId}`);
  }

  async invalidateUserFeed(userId: string): Promise<void> {
    try {
      await redisClient.del(this.getQueueKey(userId));
    } catch (error) {
      console.error(`[FeedService] Failed to invalidate feed cache for ${userId}:`, error);
    }
  }
}

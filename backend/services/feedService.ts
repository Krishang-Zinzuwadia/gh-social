import redisClient from '../config/redis.js';
import { mlService, type MlRecommendationBatches } from './mlService.js';

export class FeedService {
  private SESSION_TTL = 600; // 10 minutes cache lifetime

  private getQueueKey(userId: string): string {
    return `user:${userId}:delivery_queue`;
  }

  private flattenRecommendationBatches(batches: MlRecommendationBatches): unknown[] {
    return ['batch_1', 'batch_2', 'batch_3'].flatMap((key) => {
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
  async getCachedFeed(userId: string): Promise<any[]> {
    const queueKey = this.getQueueKey(userId);

    try {
      const rawFeedItems = await redisClient.lrange(queueKey, 0, -1);

      if (!rawFeedItems || rawFeedItems.length === 0) {
        return [];
      }

      return rawFeedItems.map((item: string) => JSON.parse(item));
    } catch (error) {
      console.error('[FeedService] Failed to retrieve cached feed:', error);
      throw error;
    }
  }

  async getOrGenerateFeed(userId: string): Promise<any[]> {
    const cachedFeed = await this.getCachedFeed(userId);
    if (cachedFeed.length > 0) {
      return cachedFeed;
    }

    const batches = await mlService.generateRecommendations(userId);
    const recommendations = this.flattenRecommendationBatches(batches);
    await this.processAndCacheBatch(userId, recommendations);
    return recommendations;
  }

  async invalidateUserFeed(userId: string): Promise<void> {
    try {
      await redisClient.del(this.getQueueKey(userId));
    } catch (error) {
      console.error(`[FeedService] Failed to invalidate feed cache for ${userId}:`, error);
    }
  }
}

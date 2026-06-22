import redisClient from '../config/redis.js';
import { db } from '../db/index.js';
import { repos } from '../db/schema.js';
import { inArray } from 'drizzle-orm';

export class FeedService {
  private SESSION_TTL = 300; // 5 minutes cache lifetime

  
  //Core Task: Stitches raw ML scoring IDs with relational metadata from PostgreSQL and caches it
  
  async processAndCacheBatch(userId: string, mlRepoIds: string[]): Promise<void> {
    const fallbackIds = mlRepoIds.slice(0, 15); // Safeguard to guarantee exactly 15 elements
    const queueKey = `user:${userId}:delivery_queue`;

    try {
      // Fetching metadata in a single batch query using real Drizzle ORM syntax
      const dbRepos = await db
        .select()
        .from(repos)
        .where(inArray(repos.repo_id, fallbackIds));

      // Format the database payload into a clean structure optimized json file for the frontend layout
      const formattedPosts = dbRepos.map((repo: any) => ({
        id: repo.repo_id,
        url: repo.github_repo_url,
        title: repo.repo_name,
        owner: repo.owner_id || 'Unknown', 
        description: repo.description,
        // Since language_used and topics are JSONB arrays in your schema, we ensure type safety with fallback arrays
        tags: [
          ...(Array.isArray(repo.language_used) ? repo.language_used : []), 
          ...(Array.isArray(repo.topics) ? repo.topics : [])
        ],
        readmePreview: repo.readme_summary,
        engagement: {
          likes: repo.likes_count ?? 0,
          comments: repo.comments_count ?? 0,
          saves: repo.saves_count ?? 0,
          views: repo.views_count ?? 0
        }
      }));

      // Store directly into your running Redis cache pipeline
      const pipeline = redisClient.pipeline();
      
      for (const post of formattedPosts) {
        pipeline.rpush(queueKey, JSON.stringify(post));
      }

      // Automatically expire the queue if the user closes the app
      pipeline.expire(queueKey, this.SESSION_TTL); 
      await pipeline.exec();

      console.log(`[FeedService] Successfully stitched and cached ${formattedPosts.length} posts for User: ${userId}`);
    } catch (error) {
      console.error('[FeedService] Error processing data batch:', error);
      throw error;
    }
  }
}
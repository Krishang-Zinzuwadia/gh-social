import { db } from '../db/index.js';
import { repos } from '../db/schema.js';
import { eq, desc, sql } from 'drizzle-orm';
import type { RepoInsert, RepoUpdate, PaginationParams } from '../types/index.js';
import redisClient from '../config/redis.js';

// Deduplication map to prevent cache stampede (thundering herd)
const inflightTrendingRequests = new Map<number, Promise<any>>();

export async function getAllRepos({ limit, offset }: PaginationParams) {
  try {
    const data = await db.select().from(repos).orderBy(desc(repos.created_at)).limit(limit).offset(offset);
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function getTrendingRepos(limitCount: number = 10) {
  try {
    const cacheKey = `trending_repos:${limitCount}`;
    const cachedData = await redisClient.get(cacheKey);
    
    if (cachedData) {
      return { data: JSON.parse(cachedData), error: null };
    }

    // If a request for this limit is already fetching from the DB, just wait for its result
    if (inflightTrendingRequests.has(limitCount)) {
      const data = await inflightTrendingRequests.get(limitCount);
      return { data, error: null };
    }

    // Otherwise, create the database fetch promise and cache it
    const fetchPromise = (async () => {
      const result = await db.select().from(repos).orderBy(desc(repos.views_count)).limit(limitCount);
      // Cache the trending repositories for 5 minutes (300 seconds)
      await redisClient.setex(cacheKey, 300, JSON.stringify(result));
      return result;
    })();

    inflightTrendingRequests.set(limitCount, fetchPromise);

    try {
      const data = await fetchPromise;
      return { data, error: null };
    } finally {
      // Remove it from inflight map once done (subsequent calls will hit Redis)
      inflightTrendingRequests.delete(limitCount);
    }
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function getRepoById(repoId: string) {
  try {
    const [data] = await db.select().from(repos).where(eq(repos.repo_id, repoId)).limit(1);
    if (!data) throw { code: 'PGRST116', message: 'Not found' };
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function createRepo(repoData: RepoInsert) {
  try {
    const [data] = await db.insert(repos).values(repoData).returning();
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function incrementRepoViews(repoId: string) {
  try {
    const result = await db.execute(sql`SELECT increment_repo_views(${repoId}::uuid) as found`);
    return { data: result[0]?.found ?? false, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function updateRepoById(repoId: string, repoData: RepoUpdate) {
  try {
    const [data] = await db.update(repos).set({
      ...repoData,
      updated_at: sql`now()`
    }).where(eq(repos.repo_id, repoId)).returning();
    if (!data) throw { code: 'PGRST116', message: 'Not found' };
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

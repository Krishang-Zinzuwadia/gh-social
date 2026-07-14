import { db } from '../db/index.js';
import { activities } from '../db/schema.js';
import { eq, and, desc, sql } from 'drizzle-orm';
import type { ActivityInsert, ActivityUpdate } from '../types/index.js';
import type { FeedbackInteraction } from '../config/feedback.js';

export async function toggleRepoLike(userId: string, repoId: string) {
  try {
    const result = await db.execute(sql`SELECT * FROM toggle_repo_like(${userId}::uuid, ${repoId}::uuid)`);
    return { data: result[0] || null, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function toggleRepoSave(userId: string, repoId: string) {
  try {
    const result = await db.execute(sql`SELECT * FROM toggle_repo_save(${userId}::uuid, ${repoId}::uuid)`);
    return { data: result[0] || null, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export interface BatchedActivityEvent {
  repo_id: string;
  action: FeedbackInteraction;
  dwell_seconds?: number;
}

export async function processBatchedActivity(userId: string, events: BatchedActivityEvent[]) {
  try {
    for (const event of events) {
      const dwell = event.dwell_seconds ? `${event.dwell_seconds} seconds` : '0 seconds';
      // For initial insert if it doesn't exist yet
      const isLike = event.action === 'like' ? 1 : 0;
      const isSave = event.action === 'save' ? true : false;
      
      try {
        // We use raw SQL for UPSERT because interval math is simpler
        // We resolve the repo_id UUID using a SELECT to handle string IDs (full_name) from the ML service, or fallback to UUID directly
        const result = await db.execute(sql`
          INSERT INTO activity (user_id, repo_id, time_spent, likelihood_count, is_saved)
          SELECT 
            ${userId}::uuid,
            repo.repo_id,
            ${dwell}::interval,
            ${isLike},
            ${isSave}
          FROM repo
          WHERE repo.full_name = ${event.repo_id} OR repo.repo_id::text = ${event.repo_id}
          ON CONFLICT (user_id, repo_id) DO UPDATE 
          SET 
            time_spent = activity.time_spent + EXCLUDED.time_spent,
            likelihood_count = CASE
                                WHEN ${event.action} = 'like' THEN 1 
                                WHEN ${event.action} = 'dislike' THEN -1
                                WHEN ${event.action} = 'unlike' THEN 0 
                                WHEN ${event.action} = 'undislike' THEN 0 
                                ELSE activity.likelihood_count 
                               END,
            is_saved = CASE 
                        WHEN ${event.action} = 'save' THEN true 
                        WHEN ${event.action} = 'unsave' THEN false 
                        ELSE activity.is_saved 
                       END
          RETURNING activity_id
        `);
        if (result.length === 0) {
          return { error: { code: 'PGRST116', message: 'Repo not found or not affected' } };
        }
      } catch (err) {
        console.error(`[ActivityService] Failed to process event for repo ${event.repo_id}:`, err);
        return { error: err };
      }
    }
    return { error: null };
  } catch (error) {
    console.error('[ActivityService] Batched activity failed:', error);
    return { error };
  }
}

export async function getAllActivity() {
  try {
    const data = await db.select().from(activities).orderBy(desc(activities.time_spent));
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function getUserActivity(userId: string) {
  try {
    const data = await db.select().from(activities).where(eq(activities.user_id, userId)).orderBy(desc(activities.time_spent));
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

import { repos } from '../db/schema.js';

export async function getSavedActivity(userId: string, limit: number = 20, offset: number = 0) {
  try {
    const data = await db.select({
      activity_id: activities.activity_id,
      user_id: activities.user_id,
      repo_id: activities.repo_id,
      is_saved: activities.is_saved,
      time_spent: activities.time_spent,
      repo: repos
    })
      .from(activities)
      .leftJoin(repos, eq(activities.repo_id, repos.repo_id))
      .where(and(eq(activities.user_id, userId), eq(activities.is_saved, true)))
      .orderBy(desc(activities.time_spent))
      .limit(limit)
      .offset(offset);
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function getActivityByUserAndRepo(userId: string, repoId: string) {
  try {
    const [data] = await db.select().from(activities).where(and(eq(activities.user_id, userId), eq(activities.repo_id, repoId))).limit(1);
    if (!data) throw { code: 'PGRST116', message: 'Not found' };
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function updateActivityByUserAndRepo(userId: string, repoId: string, activityData: ActivityUpdate) {
  try {
    const [data] = await db.update(activities)
      .set(activityData)
      .where(and(eq(activities.user_id, userId), eq(activities.repo_id, repoId)))
      .returning();
    if (!data) throw { code: 'PGRST116', message: 'Not found' };
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function getActivityById(activityId: string) {
  try {
    const [data] = await db.select().from(activities).where(eq(activities.activity_id, activityId)).limit(1);
    if (!data) throw { code: 'PGRST116', message: 'Not found' };
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function createActivity(activityData: ActivityInsert) {
  try {
    const [data] = await db.insert(activities).values(activityData).returning();
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function updateActivityById(activityId: string, activityData: ActivityUpdate) {
  try {
    const [data] = await db.update(activities).set(activityData).where(eq(activities.activity_id, activityId)).returning();
    if (!data) throw { code: 'PGRST116', message: 'Not found' };
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function deleteActivityById(activityId: string) {
  try {
    const result = await db.delete(activities).where(eq(activities.activity_id, activityId)).returning();
    return { data: null, error: null, count: result.length };
  } catch (error) { return { data: null as any, error: error as any, count: 0 }; }
}

import { db } from '../db/index.js';
import { boards, boardRepos, repos } from '../db/schema.js';
import { eq, and, desc } from 'drizzle-orm';
import type { BoardInsert } from '../types/index.js';

export async function createBoard(boardData: BoardInsert) {
  try {
    const [data] = await db.insert(boards).values(boardData).returning();
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function getBoardsByUser(userId: string, limit: number = 20, offset: number = 0) {
  try {
    const data = await db.select()
      .from(boards)
      .where(eq(boards.user_id, userId))
      .orderBy(desc(boards.created_at))
      .limit(limit)
      .offset(offset);
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function getBoardById(boardId: string) {
  try {
    const [data] = await db.select().from(boards).where(eq(boards.board_id, boardId)).limit(1);
    if (!data) throw { code: 'PGRST116', message: 'Not found' };
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function addRepoToBoard(boardId: string, repoId: string) {
  try {
    const [data] = await db.insert(boardRepos).values({ board_id: boardId, repo_id: repoId }).returning();
    return { data, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

export async function removeRepoFromBoard(boardId: string, repoId: string) {
  try {
    const result = await db.delete(boardRepos).where(and(eq(boardRepos.board_id, boardId), eq(boardRepos.repo_id, repoId))).returning();
    return { data: null, error: null, count: result.length };
  } catch (error) { return { data: null as any, error: error as any, count: 0 }; }
}

export async function deleteBoard(boardId: string) {
  try {
    const result = await db.delete(boards).where(eq(boards.board_id, boardId)).returning();
    return { data: null, error: null, count: result.length };
  } catch (error) { return { data: null as any, error: error as any, count: 0 }; }
}

export async function getReposForBoard(boardId: string) {
  try {
    const result = await db.select({
      repo_id: boardRepos.repo_id,
      added_at: boardRepos.added_at,
      repo: repos
    })
    .from(boardRepos)
    .leftJoin(repos, eq(boardRepos.repo_id, repos.repo_id))
    .where(eq(boardRepos.board_id, boardId))
    .orderBy(desc(boardRepos.added_at));

    return { data: result, error: null };
  } catch (error) { return { data: null as any, error: error as any }; }
}

import { sql } from 'drizzle-orm';

export async function saveRepoToBoardAtomic(userId: string, boardId: string, repoId: string) {
  try {
    const result = await db.transaction(async (tx) => {
      const existingActivity = await tx.execute(sql`
        SELECT is_saved
        FROM activity
        WHERE user_id = ${userId}::uuid AND repo_id = ${repoId}::uuid
        LIMIT 1;
      `);
      const wasSaved = Array.isArray(existingActivity) && existingActivity[0]?.is_saved === true;

      // 1. Ensure the repo is saved by the user (satisfies the enforce_repo_saved_for_board trigger)
      await tx.execute(sql`
        INSERT INTO activity (user_id, repo_id, is_saved) 
        VALUES (${userId}::uuid, ${repoId}::uuid, true) 
        ON CONFLICT (user_id, repo_id) DO UPDATE SET is_saved = true;
      `);

      if (!wasSaved) {
        await tx.execute(sql`
          INSERT INTO interaction_events (user_id, repo_id, action, metadata)
          VALUES (${userId}::uuid, ${repoId}::uuid, 'save', '{}'::jsonb);
        `);
      }

      // 2. Add the repo to the board (if not already there)
      await tx.execute(sql`
        INSERT INTO board_repos (board_id, repo_id) 
        VALUES (${boardId}::uuid, ${repoId}::uuid) 
        ON CONFLICT DO NOTHING;
      `);

      return { success: true, saveStateChanged: !wasSaved };
    });

    return { data: result, error: null };
  } catch (error) { 
    return { data: null as any, error: error as any }; 
  }
}

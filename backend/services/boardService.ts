/*
 * Board service
 * Database access functions for boards and the board_repos join table.
 */
import supabase from '../config/supabase.js';
import type { BoardInsert, BoardRow, BoardRepoRow } from '../types/index.js';

const boardTable = 'boards';
const boardReposTable = 'board_repos';

/**
 * Insert a new board record.
 */
export function createBoard(boardData: BoardInsert) {
  return supabase.from(boardTable).insert(boardData).select().single();
}

/**
 * Fetch boards owned by a given user (newest first).
 */
export function getBoardsByUser(userId: string) {
  return supabase.from(boardTable).select('*').eq('user_id', userId).order('created_at', { ascending: false });
}

/**
 * Fetch a single board by primary key.
 */
export function getBoardById(boardId: string) {
  return supabase.from(boardTable).select('*').eq('board_id', boardId).single();
}

/**
 * Add a repository to a board. The DB trigger enforces the repo was saved by the board owner.
 */
export function addRepoToBoard(boardId: string, repoId: string) {
  return supabase.from(boardReposTable).insert({ board_id: boardId, repo_id: repoId }).select().single();
}

/**
 * Remove a repository from a board.
 */
export function removeRepoFromBoard(boardId: string, repoId: string) {
  return supabase
    .from(boardReposTable)
    .delete({ count: 'exact' })
    .eq('board_id', boardId)
    .eq('repo_id', repoId);
}

/**
 * Delete a board by primary key.
 */
export function deleteBoard(boardId: string) {
  return supabase
    .from(boardTable)
    .delete({ count: 'exact' })
    .eq('board_id', boardId);
}

/**
 * List repo entries for a board, including a nested repo object when available.
 */
export function getReposForBoard(boardId: string) {
  return supabase
    .from(boardReposTable)
    .select('repo_id, added_at, repo:repo(*)')
    .eq('board_id', boardId)
    .order('added_at', { ascending: false });
}

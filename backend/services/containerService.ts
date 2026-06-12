/**
 * containerService
 * ----------------
 * Service layer for 'boards_containers' and 'container_boards'.
 * Uses Supabase client for all DB operations. Primary responsibilities:
 * - Create and query containers owned by users
 * - Manage board links inside containers
 * - Create a container pre-seeded with two primary public boards for a user
 */
import supabase from '../config/supabase.js';
import type { BoardsContainerInsert, BoardsContainerRow, BoardRow } from '../types/index.js';

type CreateContainerResult =
  | { data: { container: BoardsContainerRow; boards: BoardRow[] }; error?: undefined }
  | { data?: undefined; error: unknown };

const containerTable = 'boards_containers';
const containerBoardsTable = 'container_boards';

/**
 * Insert a new container record.
 * @param containerData - partial container fields (user_id, container_name, description)
 */
export function createContainer(containerData: BoardsContainerInsert) {
  return supabase.from(containerTable).insert(containerData).select().single();
}

/**
 * Fetch containers owned by a user (newest first).
 * @param userId - UUID of the user
 */
export function getContainersByUser(userId: string) {
  return supabase.from(containerTable).select('*').eq('user_id', userId).order('created_at', { ascending: false });
}

/**
 * Fetch a single container by primary key.
 * @param containerId - UUID of the container
 */
export function getContainerById(containerId: string) {
  return supabase.from(containerTable).select('*').eq('container_id', containerId).single();
}

/**
 * Link an existing board into a container.
 * @param containerId - UUID of the container
 * @param boardId - UUID of the board to add
 */
export function addBoardToContainer(containerId: string, boardId: string) {
  return supabase.from(containerBoardsTable).insert({ container_id: containerId, board_id: boardId }).select().single();
}

/**
 * Remove a board link from a container.
 * @param containerId - UUID of the container
 * @param boardId - UUID of the board to remove
 */
export function removeBoardFromContainer(containerId: string, boardId: string) {
  return supabase
    .from(containerBoardsTable)
    .delete({ count: 'exact' })
    .eq('container_id', containerId)
    .eq('board_id', boardId);
}

/**
 * Delete a container by primary key.
 */
export function deleteContainer(containerId: string) {
  return supabase
    .from(containerTable)
    .delete({ count: 'exact' })
    .eq('container_id', containerId);
}

/**
 * List boards attached to a container, including nested board objects when available.
 */
export function getBoardsForContainer(containerId: string) {
  return supabase
    .from(containerBoardsTable)
    .select('board_id, added_at, board:boards(*)')
    .eq('container_id', containerId)
    .order('added_at', { ascending: false });
}

/**
 * Create a container and seed it with two primary public boards owned by the same user.
 * Runs atomically in a single PG transaction — no orphaned rows on failure.
 * Returns { data: { container, boards } } on success or { error } on failure.
 */
export async function createContainerWithDefaults(userId: string, containerName = 'Default Boards Container'): Promise<CreateContainerResult> {
  const { data, error } = await supabase
    .rpc('create_container_with_defaults', { uid: userId, container_name: containerName });

  if (error) return { error };
  return { data };
}

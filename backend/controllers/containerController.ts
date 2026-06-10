/**
 * containerController
 * -------------------
 * HTTP controller layer for container endpoints. Validates input, delegates
 * to the service layer, and uses standardized response helpers.
 */
import type { Request, Response } from 'express';
import * as containerService from '../services/containerService.js';
import { sendError, sendSuccess, sendSupabaseError, sendControllerError } from '../utils/response.js';
import { isValidUuid } from '../utils/validators.js';

/**
 * POST / - create a container and auto-seed two public boards for the user.
 * Body: { user_id: string, container_name?: string }
 */
export async function createContainer(req: Request, res: Response): Promise<void> {
  const { user_id, container_name } = req.body as { user_id?: string; container_name?: string };
  if (!user_id) return sendError(res, 400, 'user_id is required.');
  if (!isValidUuid(user_id)) return sendError(res, 400, 'user_id must be a valid UUID.');

  try {
    const result = await containerService.createContainerWithDefaults(user_id, container_name);
    if ((result as any).error) return sendSupabaseError(res, (result as any).error);
    return sendSuccess(res, 201, (result as any).data);
  } catch (err) {
    return sendControllerError(res, err);
  }
}

/**
 * GET /user/:userId - list all containers for a user.
 */
export async function getContainersByUser(req: Request, res: Response): Promise<void> {
  const userId = req.params.userId as string;
  if (!isValidUuid(userId)) return sendError(res, 400, 'userId must be a valid UUID.');

  const { data, error } = await containerService.getContainersByUser(userId);
  if (error) return sendSupabaseError(res, error);
  return sendSuccess(res, 200, data);
}

/**
 * GET /:containerId - fetch a single container by id.
 */
export async function getContainerById(req: Request, res: Response): Promise<void> {
  const containerId = req.params.containerId as string;
  if (!isValidUuid(containerId)) return sendError(res, 400, 'containerId must be a valid UUID.');

  const { data, error } = await containerService.getContainerById(containerId);
  if (error) return sendSupabaseError(res, error);
  return sendSuccess(res, 200, data);
}

/**
 * POST /:containerId/boards - attach an existing board to the container.
 * Body: { board_id: string }
 */
export async function addBoardToContainer(req: Request, res: Response): Promise<void> {
  const containerId = req.params.containerId as string;
  const boardId = req.body.board_id as string;
  if (!isValidUuid(containerId) || !isValidUuid(boardId)) return sendError(res, 400, 'containerId and board_id must be valid UUIDs.');

  try {
    const { data, error } = await containerService.addBoardToContainer(containerId, boardId);
    if (error) return sendSupabaseError(res, error);
    return sendSuccess(res, 201, data);
  } catch (err) {
    return sendControllerError(res, err);
  }
}

/**
 * DELETE /:containerId/boards/:boardId - remove board from container.
 */
export async function removeBoardFromContainer(req: Request, res: Response): Promise<void> {
  const { containerId, boardId } = req.params as { containerId: string; boardId: string };
  if (!isValidUuid(containerId) || !isValidUuid(boardId)) return sendError(res, 400, 'containerId and boardId must be valid UUIDs.');

  try {
    const { error, count } = await containerService.removeBoardFromContainer(containerId, boardId);
    if (error) return sendSupabaseError(res, error);
    if (typeof count === 'number' && count === 0) return sendError(res, 404, 'Board not found in container.');
    return sendSuccess(res, 200, { message: 'Board removed from container.' });
  } catch (err) {
    return sendControllerError(res, err);
  }
}

/**
 * DELETE /:containerId - delete a container.
 */
export async function deleteContainerById(req: Request, res: Response): Promise<void> {
  const containerId = req.params.containerId as string;
  if (!isValidUuid(containerId)) return sendError(res, 400, 'containerId must be a valid UUID.');

  try {
    const { error, count } = await containerService.deleteContainer(containerId);
    if (error) return sendSupabaseError(res, error);
    if (typeof count === 'number' && count === 0) return sendError(res, 404, 'Container not found.');
    return sendSuccess(res, 200, { message: 'Container deleted.' });
  } catch (err) {
    return sendControllerError(res, err);
  }
}

/**
 * GET /:containerId/boards - list boards in the container.
 */
export async function getBoardsForContainer(req: Request, res: Response): Promise<void> {
  const containerId = req.params.containerId as string;
  if (!isValidUuid(containerId)) return sendError(res, 400, 'containerId must be a valid UUID.');

  const { data, error } = await containerService.getBoardsForContainer(containerId);
  if (error) return sendSupabaseError(res, error);
  return sendSuccess(res, 200, data);
}

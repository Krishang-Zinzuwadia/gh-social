import type { Request, Response } from 'express';
import * as activityService from '../services/activityService.js';
import { sendError, sendSuccess, sendSupabaseError } from '../utils/response.js';

// Return every activity row.
export async function getAllActivity(_req: Request, res: Response): Promise<void> {
  const { data, error } = await activityService.getAllActivity();

  if (error) {
    return sendSupabaseError(res, error);
  }

  return sendSuccess(res, 200, data);
}

// Return activity rows for a specific user.
export async function getUserActivity(req: Request, res: Response): Promise<void> {
  const userId = req.params.userId as string;
  const { data, error } = await activityService.getUserActivity(userId);

  if (error) {
    return sendSupabaseError(res, error);
  }

  return sendSuccess(res, 200, data);
}

// Return saved activity rows for a specific user.
export async function getSavedActivity(req: Request, res: Response): Promise<void> {
  const userId = req.params.userId as string;
  const { data, error } = await activityService.getSavedActivity(userId);

  if (error) {
    return sendSupabaseError(res, error);
  }

  return sendSuccess(res, 200, data);
}

// Return one activity row for a user and repo pair.
export async function getActivityByUserAndRepo(req: Request, res: Response): Promise<void> {
  const { userId, repoId } = req.params as { userId: string; repoId: string };
  const { data, error } = await activityService.getActivityByUserAndRepo(userId, repoId);

  if (error) {
    return sendSupabaseError(res, error);
  }

  return sendSuccess(res, 200, data);
}

// Update activity when the app knows user_id and repo_id.
export async function updateActivityByUserAndRepo(req: Request, res: Response): Promise<void> {
  const { userId, repoId } = req.params as { userId: string; repoId: string };
  const { data, error } = await activityService.updateActivityByUserAndRepo(
    userId,
    repoId,
    req.body,
  );

  if (error) {
    return sendSupabaseError(res, error, {
      notFoundMessage: 'Activity not found for this user and repo.',
    });
  }

  return sendSuccess(res, 200, data);
}

// Return one activity row by its primary key.
export async function getActivityById(req: Request, res: Response): Promise<void> {
  const activityId = req.params.activityId as string;
  const { data, error } = await activityService.getActivityById(activityId);

  if (error) {
    return sendSupabaseError(res, error, {
      notFoundMessage: 'Activity not found.',
    });
  }

  return sendSuccess(res, 200, data);
}

// Create a new activity row.
export async function createActivity(req: Request, res: Response): Promise<void> {
  const { data, error } = await activityService.createActivity(req.body);

  if (error) {
    return sendSupabaseError(res, error);
  }

  return sendSuccess(res, 201, data);
}

// Update activity directly by primary key.
export async function updateActivityById(req: Request, res: Response): Promise<void> {
  const activityId = req.params.activityId as string;
  const { data, error } = await activityService.updateActivityById(activityId, req.body);

  if (error) {
    return sendSupabaseError(res, error, {
      notFoundMessage: 'Activity not found.',
    });
  }

  return sendSuccess(res, 200, data);
}

// Delete activity directly by primary key.
export async function deleteActivityById(req: Request, res: Response): Promise<void> {
  const activityId = req.params.activityId as string;
  const { error } = await activityService.deleteActivityById(activityId);

  if (error) {
    return sendSupabaseError(res, error, {
      notFoundMessage: 'Activity not found.',
    });
  }

  res.status(204).send();
}

import type { Request, Response } from 'express';
import * as userService from '../services/userService.js';
import { sendError, sendSuccess, sendSupabaseError } from '../utils/response.js';
import { isValidUuid } from '../utils/validators.js';

// Fetch a user's public profile.
export async function getUserProfile(req: Request, res: Response): Promise<void> {
  const username = req.params.username as string;

  const { data, error } = await userService.getUserProfile(username);

  if (error) {
    return sendSupabaseError(res, error, {
      notFoundMessage: 'User not found',
    });
  }

  return sendSuccess(res, 200, data);
}

// Follow a user.
export async function followUser(req: Request, res: Response): Promise<void> {
  const username = req.params.username as string;
  const { follower_id: followerId } = req.body as { follower_id?: string };

  if (!followerId) {
    return sendError(res, 400, 'follower_id is required in the request body.');
  }

  if (!isValidUuid(followerId)) {
    return sendError(res, 400, 'follower_id must be a valid UUID.');
  }

  const { data: targetUser, error: targetError } =
    await userService.getUserIdByUsername(username);

  if (targetError) {
    return sendSupabaseError(res, targetError, {
      notFoundMessage: 'Target user not found',
    });
  }

  if (!targetUser) {
    return sendError(res, 404, 'Target user not found');
  }

  const { user_id: targetUserId } = targetUser as { user_id: string };

  if (followerId === targetUserId) {
    return sendError(res, 400, 'You cannot follow yourself.');
  }

  const { error: followError } = await userService.followUser(followerId, targetUserId);

  if (followError) {
    return sendSupabaseError(res, followError, {
      conflictMessage: 'You are already following this user.',
      invalidReferenceMessage: 'Invalid follower_id: User does not exist.',
    });
  }

  return sendSuccess(res, 200, { message: `Successfully followed ${username}` });
}

// Unfollow a user.
export async function unfollowUser(req: Request, res: Response): Promise<void> {
  const username = req.params.username as string;
  const followerId = req.query.follower_id as string | undefined;

  if (!followerId) {
    return sendError(res, 400, 'follower_id is required as a query parameter.');
  }

  if (!isValidUuid(followerId)) {
    return sendError(res, 400, 'follower_id must be a valid UUID.');
  }

  const { data: targetUser, error: targetError } =
    await userService.getUserIdByUsername(username);

  if (targetError) {
    return sendSupabaseError(res, targetError, {
      notFoundMessage: 'Target user not found',
    });
  }

  if (!targetUser) {
    return sendError(res, 404, 'Target user not found');
  }

  const { user_id: targetUserId } = targetUser as { user_id: string };

  const { error: unfollowError, count } = await userService.unfollowUser(
    followerId,
    targetUserId,
  );

  if (unfollowError) {
    return sendSupabaseError(res, unfollowError);
  }

  if (count === 0) {
    return sendError(res, 400, 'You are not following this user.');
  }

  return sendSuccess(res, 200, { message: `Successfully unfollowed ${username}` });
}

// List all users.
export async function getAllUsers(_req: Request, res: Response): Promise<void> {
  const { data, error } = await userService.getAllUsers();

  if (error) {
    return sendSupabaseError(res, error);
  }

  return sendSuccess(res, 200, data);
}

// Fetch a user's public profile by UUID.
export async function getUserById(req: Request, res: Response): Promise<void> {
  const userId = req.params.userId as string;

  if (!isValidUuid(userId)) {
    return sendError(res, 400, 'userId must be a valid UUID.');
  }

  const { data, error } = await userService.getUserById(userId);

  if (error) {
    return sendSupabaseError(res, error, {
      notFoundMessage: 'User not found',
    });
  }

  return sendSuccess(res, 200, data);
}

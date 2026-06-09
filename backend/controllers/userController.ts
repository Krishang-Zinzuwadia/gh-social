import type { Request, Response } from 'express';
import type { AuthRequest } from '../middlewares/authMiddleware.js'; // Bring in your custom type
import * as userService from '../services/userService.js';
import { sendError, sendSuccess, sendSupabaseError } from '../utils/response.js';
import { isValidUuid } from '../utils/validators.js'; // You might not need this anymore for the follower, but keep it if you use it elsewhere

// Fetch a user's public profile (Remains standard Request as it is a public route)
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

// Follow a user (Uses AuthRequest)
export async function followUser(req: AuthRequest, res: Response): Promise<void> {
  const username = req.params.username as string;
  
  // SECURE: Grab the ID directly from the verified JWT
  const followerId = req.user?.userId;

  if (!followerId) {
    return sendError(res, 401, 'Unauthorized request. Please log in.');
  }

  const { data: targetUser, error: targetError } = await userService.getUserIdByUsername(username);

  if (targetError) {
    return sendSupabaseError(res, targetError, {
      notFoundMessage: 'Target user not found',
    });
  }

  if (!targetUser) {
    return sendError(res, 404, 'Target user not found');
  }

  const targetUserId = (targetUser as { user_id: string }).user_id;

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

// Unfollow a user (Uses AuthRequest)
export async function unfollowUser(req: AuthRequest, res: Response): Promise<void> {
  const username = req.params.username as string;
  
  // SECURE: Grab the ID directly from the verified JWT
  const followerId = req.user?.userId;

  if (!followerId) {
    return sendError(res, 401, 'Unauthorized request. Please log in.');
  }

  const { data: targetUser, error: targetError } = await userService.getUserIdByUsername(username);

  if (targetError) {
    return sendSupabaseError(res, targetError, {
      notFoundMessage: 'Target user not found',
    });
  }

  if (!targetUser) {
    return sendError(res, 404, 'Target user not found');
  }

  const targetUserId = (targetUser as { user_id: string }).user_id;

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
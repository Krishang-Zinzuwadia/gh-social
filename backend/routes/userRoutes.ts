import { Router } from 'express';
import {
  getAllUsers,
  getUserById,
  getUserProfile,
  updateProfile,
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
} from '../controllers/userController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router: Router = Router();

// GET /api/users - List all users
router.get('/', getAllUsers);

// GET /api/users/id/:userId - Fetch a user's public profile by UUID
router.get('/id/:userId', getUserById);

// PATCH /api/users/me - Update current user's profile
router.patch('/me', requireAuth, updateProfile);

router.get('/:username/followers', getFollowers);
router.get('/:username/following', getFollowing);

// GET /api/users/:username - Fetch a user's public profile
router.get('/:username', getUserProfile);

// POST /api/users/:username/follow - Follow a user
router.post('/:username/follow', requireAuth, followUser);

// DELETE /api/users/:username/follow - Unfollow a user
router.delete('/:username/follow', requireAuth, unfollowUser);

export default router;

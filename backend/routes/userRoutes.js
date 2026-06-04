import express from 'express';
import { getProfile, followUser, unfollowUser } from '../controllers/userController.js';

const router = express.Router();

// GET /api/users/:username - Fetch a user's public profile
router.get('/:username', getProfile);

// POST /api/users/:username/follow - Follow a user
router.post('/:username/follow', followUser);

// DELETE /api/users/:username/follow - Unfollow a user
router.delete('/:username/follow', unfollowUser);

export default router;
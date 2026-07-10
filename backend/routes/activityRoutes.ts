import { Router } from 'express';
import {
  getAllActivity,
  getUserActivity,
  getSavedActivity,
  getActivityByUserAndRepo,
  updateActivityByUserAndRepo,
  getActivityById,
  createActivity,
  updateActivityById,
  deleteActivityById,
  likeRepo,
  saveRepo,
  processBatchedActivity,
} from '../controllers/activityController.js';

import { requireAuth } from '../middlewares/authMiddleware.js';

const router: Router = Router();

// Routes only connect URLs to controller functions.

// Process batched activity events
router.post('/batch', requireAuth, processBatchedActivity);

// Get all activity records.
router.get('/', getAllActivity);

// Get all activity records for one user.
router.get('/user/:userId', getUserActivity);

// Get saved activity records for one user.
router.get('/user/:userId/saved', getSavedActivity);

// Get one activity record for a specific user and repo.
router.get('/user/:userId/repo/:repoId', getActivityByUserAndRepo);

// Update one activity record using user and repo ids.
router.patch('/user/:userId/repo/:repoId', updateActivityByUserAndRepo);

// Get one activity record by activity id.
router.get('/:activityId', getActivityById);

// Create a new activity record.
router.post('/', createActivity);

// Update one activity record by activity id.
router.patch('/:activityId', updateActivityById);

// Delete one activity record by activity id.
router.delete('/:activityId', deleteActivityById);

// Toggle like for a user/repo pair.
router.post('/user/:userId/repo/:repoId/like', requireAuth, likeRepo);

// Toggle save for a user/repo pair.
router.post('/user/:userId/repo/:repoId/save', requireAuth, saveRepo);

export default router;

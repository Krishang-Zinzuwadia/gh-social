import express from 'express';
import * as boardController from '../controllers/boardController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Create a board. Body: { user_id, board_name, visibility?, description? }
router.post('/', requireAuth, boardController.createBoard);

// List all boards for a user. Path param: userId
router.get('/user/:userId', boardController.getBoardsByUser);

// Get a single board by id. Path param: boardId
router.get('/:boardId', boardController.getBoardById);

// Add a saved repo to a board. Body: { repo_id }
router.post('/:boardId/repos', requireAuth, boardController.addRepoToBoard);

// Atomically save a repo and add it to a board. Body: { user_id, repo_id }
router.post('/:boardId/save-repo', requireAuth, boardController.saveRepoToBoard);

// Remove a repo from a board. Path params: boardId, repoId
router.delete('/:boardId/repos/:repoId', requireAuth, boardController.removeRepoFromBoard);

// Delete a board entirely. Path param: boardId
router.delete('/:boardId', requireAuth, boardController.deleteBoardById);

// List repos saved on a board. Path param: boardId
router.get('/:boardId/repos', boardController.getReposForBoard);

export default router;

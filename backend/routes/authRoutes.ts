import { Router } from 'express';
import { signUp, login, logout, getOAuthUrl } from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router: Router = Router();

// Public routes
router.post('/signup', signUp);
router.post('/login', login);
router.get('/oauth/:provider', getOAuthUrl);

// Protected routes (requires Bearer token)
router.post('/logout', requireAuth, logout);

// Example of how to protect another route:
// router.get('/me', requireAuth, getMyProfile);

export default router;
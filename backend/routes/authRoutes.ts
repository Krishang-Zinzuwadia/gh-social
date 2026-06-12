import { Router } from 'express';
import { signUp, login, logout, getOAuthUrl, refreshToken, handleOAuthCallback} from '../controllers/authController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router: Router = Router();

// Public routes
router.post('/signup', signUp);
router.post('/login', login);
router.get('/oauth/:provider', getOAuthUrl);
router.post('/refresh', refreshToken);
router.post('/logout', requireAuth, logout);
router.get('/callback', handleOAuthCallback);

export default router;
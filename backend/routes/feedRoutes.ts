import { Router } from 'express';
import { getFeedForMobile } from '../controllers/feedController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();

router.get('/feed', requireAuth, getFeedForMobile);

export default router;

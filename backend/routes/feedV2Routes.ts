import { Router } from 'express';

import { getFeedV2 } from '../controllers/feedV2Controller.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();
router.post('/feed', requireAuth, getFeedV2);
export default router;

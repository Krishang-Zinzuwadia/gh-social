import { Router } from 'express';

import { processInteractionsV2 } from '../controllers/activityV2Controller.js';
import { requireAuth } from '../middlewares/authMiddleware.js';

const router = Router();
router.post('/interactions/batch', requireAuth, processInteractionsV2);
export default router;

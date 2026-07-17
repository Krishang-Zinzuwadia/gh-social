import { Router } from 'express';

import { ingestTrendingSnapshot, upsertRepositories } from '../controllers/ingestionController.js';
import { requireInternalSecret } from '../middlewares/internalAuthMiddleware.js';

const router = Router();
router.post('/repositories/upsert', requireInternalSecret, upsertRepositories);
router.post('/trending/snapshots', requireInternalSecret, ingestTrendingSnapshot);
export default router;

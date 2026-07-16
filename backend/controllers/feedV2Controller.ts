import type { Response } from 'express';

import type { AuthRequest } from '../middlewares/authMiddleware.js';
import { isValidUuid } from '../utils/validators.js';
import { inRolloutCohort } from '../config/features.js';
import { getApplicationRuntime } from '../runtime/applicationRuntime.js';

export async function getFeedV2(req: AuthRequest, res: Response): Promise<void> {
  const userId = req.user?.userId;
  const { feed_request_id, session_id, limit = 10, cursor = null } = req.body ?? {};
  if (!userId) { res.status(401).json({ error: 'Authentication required.' }); return; }
  const runtime = getApplicationRuntime();
  if (!runtime.flags.FEED_V2 || !inRolloutCohort(userId, 'FEED_V2_CANARY')) {
    res.status(404).json({ error: 'Feed v2 is not enabled for this cohort.' }); return;
  }
  if (!isValidUuid(feed_request_id) || !isValidUuid(session_id)) {
    res.status(400).json({ error: 'feed_request_id and session_id must be UUIDs.' }); return;
  }
  if (!Number.isInteger(limit) || limit < 1 || limit > 25 || (cursor !== null && typeof cursor !== 'string')) {
    res.status(400).json({ error: 'limit must be 1-25 and cursor must be null or a string.' }); return;
  }
  try {
    res.status(200).json(await runtime.feed.getFeed(userId, { feed_request_id, session_id, limit, cursor }));
  } catch (error) {
    console.error('[FeedV2Controller] Failed:', error);
    res.status(503).json({ error: 'Feed is temporarily unavailable.' });
  }
}

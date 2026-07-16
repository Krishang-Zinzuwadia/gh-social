import { Response } from 'express';
import { FeedService } from '../services/feedService.js';
import { type AuthRequest } from '../middlewares/authMiddleware.js';

const feedService = new FeedService();

export const getFeedForMobile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
       res.status(401).json({ success: false, message: 'Authentication required.' });
       return;
    }

    const feed = await feedService.getOrGenerateFeed(userId);

    res.status(200).json({
      success: true,
      count: feed.length,
      data: feed
    });
  } catch (error) {
    console.error('[FeedController] Failed to serve mobile feed:', error);
     res.status(500).json({ success: false, message: 'Internal server error.' });
  }
};

import { Request, Response } from 'express'; 
import { FeedService } from '../services/feedService.js';
import { type AuthRequest } from '../middlewares/authMiddleware.js';

const feedService = new FeedService();

export const receiveMlRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, recommendations, repoIds } = req.body;

    const payload = Array.isArray(recommendations) ? recommendations : repoIds;

    if (!userId || !Array.isArray(payload)) {
       res.status(400).json({ 
        success: false, 
        message: 'Invalid payload format. Expected "userId" and "recommendations" array.' 
      });
       return;
    }

    await feedService.processAndCacheBatch(userId, payload);

     res.status(200).json({ 
      success: true, 
      message: `Successfully received and cached ${payload.length} recommendations for user.` 
    });
  } catch (error) {
    console.error('[FeedController] Internal pipeline failure:', error);
     res.status(500).json({ 
      success: false, 
      message: 'Internal server error while processing delivery pipeline.' 
    });
  }
};

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

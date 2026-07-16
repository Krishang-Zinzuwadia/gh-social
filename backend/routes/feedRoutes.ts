import { Router } from 'express';
import { receiveMlRecommendations, getFeedForMobile } from '../controllers/feedController.js';
import { requireAuth } from '../middlewares/authMiddleware.js';
import { requireInternalSecret } from '../middlewares/internalAuthMiddleware.js';

const router = Router();

// Endpoint 1: Internal ML service callback — protected by shared secret
// URL: POST http://localhost:5000/api/internal/recommendations
router.post('/internal/recommendations', requireInternalSecret, receiveMlRecommendations);

// Endpoint 2: Mobile app pulls the cached feed
// URL: GET http://localhost:5000/api/feed
router.get('/feed', requireAuth, getFeedForMobile);

export default router;

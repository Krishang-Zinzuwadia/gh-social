import { Router, type Request, type Response, type NextFunction } from 'express';
import { receiveMlRecommendations, getFeedForMobile } from '../controllers/feedController.js';

const router = Router();

/**
 * Shared-secret guard for internal service-to-service endpoints.
 * The ML service must send the secret in the `X-Internal-Secret` header.
 * Set INTERNAL_API_SECRET in the backend .env and mirror it in the ML service .env.
 */
const INTERNAL_SECRET = process.env.INTERNAL_API_SECRET;

function requireInternalSecret(req: Request, res: Response, next: NextFunction): void {
  if (!INTERNAL_SECRET) {
    // Fail closed: if the secret is not configured, deny all requests.
    res.status(503).json({ success: false, message: 'Internal API secret is not configured on this server.' });
    return;
  }

  const provided = req.headers['x-internal-secret'];
  if (!provided || provided !== INTERNAL_SECRET) {
    res.status(401).json({ success: false, message: 'Unauthorized: invalid or missing internal secret.' });
    return;
  }

  next();
}

// Endpoint 1: Internal ML service callback — protected by shared secret
// URL: POST http://localhost:5000/api/internal/recommendations
router.post('/internal/recommendations', requireInternalSecret, receiveMlRecommendations);

// Endpoint 2: Mobile app pulls the cached feed
// URL: GET http://localhost:5000/api/feed?userId=your_user_id
router.get('/feed', getFeedForMobile);

export default router;
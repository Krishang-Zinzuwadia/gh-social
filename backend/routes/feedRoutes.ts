import { Router } from 'express'; 
import { receiveMlRecommendations } from '../controllers/feedController.js';

const router = Router();

/**
 * Expose the POST endpoint for Subhro's ML model 
 * Full URL when running locally will be: http://localhost:5000/api/internal/recommendations
 */
router.post('/internal/recommendations', receiveMlRecommendations);

export default router;
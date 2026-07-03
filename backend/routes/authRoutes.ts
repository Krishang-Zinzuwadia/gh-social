import { Router } from "express";
import rateLimit from "express-rate-limit";
import {
  signUp,
  login,
  logout,
  getOAuthUrl,
  refreshToken,
  handleOAuthCallback,
  exchangeAuthCode,
} from "../controllers/authController.js";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: { error: "Too many requests from this IP, please try again after 15 minutes" },
});

const router: Router = Router();

// Apply rate limiter to all auth routes
router.use(authLimiter);

// Public routes
router.post("/signup", signUp);
router.post("/login", login);
router.get("/oauth/:provider", getOAuthUrl);
router.post("/refresh", refreshToken);
router.post("/logout", logout);
router.get("/callback", handleOAuthCallback);
// Exchange Supabase auth code for backend session
router.post("/exchange", exchangeAuthCode);

export default router;

import { Router } from "express";
import {
  signUp,
  login,
  logout,
  getOAuthUrl,
  refreshToken,
  handleOAuthCallback,
  exchangeAuthCode,
} from "../controllers/authController.js";


const router: Router = Router();
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

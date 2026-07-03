import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import type { Request, Response } from "express";
import jwt from "jsonwebtoken";
import supabase, { supabaseAdmin } from "../config/supabase.js";
import { db } from "../db/index.js";
import { oauthCodes, refreshTokens, users } from "../db/schema.js";
import { mlService } from "../services/mlService.js";
import {
  sendControllerError,
  sendError,
  sendSuccess,
} from "../utils/response.js";
import { isValidUuid } from "../utils/validators.js";

const CLIENT_URL = process.env.CLIENT_URL;
const BACKEND_URL = process.env.BACKEND_URL;

if (!CLIENT_URL)
  throw new Error("Missing required environment variable: CLIENT_URL");
if (!BACKEND_URL)
  throw new Error("Missing required environment variable: BACKEND_URL");

const JWT_SECRET = process.env.JWT_SECRET as string;
if (!JWT_SECRET) {
  throw new Error(
    "FATAL ERROR: JWT_SECRET is not defined in environment variables.",
  );
}

const REFRESH_TOKEN_DURATION_MS = 30 * 24 * 60 * 60 * 1000;
import type { CookieOptions } from "express";

const getRefreshCookieOptions = (): CookieOptions => {
  const isProduction = process.env.NODE_ENV === "production";
  return {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "none" : "lax",
    path: "/api/auth",
    maxAge: REFRESH_TOKEN_DURATION_MS,
  };
};

const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

const createAndStoreRefreshToken = async (userId: string, tx: any = db) => {
  const refreshToken = crypto.randomBytes(40).toString("hex");
  const tokenHash = hashToken(refreshToken);

  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_DURATION_MS);
  await tx.insert(refreshTokens).values({
    user_id: userId,
    refresh_token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  return refreshToken;
};

export async function signUp(req: Request, res: Response): Promise<void> {
  let { email, password, username, full_name } = req.body;
  if (!username || typeof username !== "string" || username.trim() === "") {
    return sendError(res, 400, "Username is required");
  }

  username = username.trim();
  try {
    if (username) {
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      if (existingUser.length > 0) {
        return sendError(res, 409, "username_taken");
      }
    }

    try {
      const identityCheck = await db.execute(sql`
        SELECT provider FROM auth.identities
        JOIN auth.users ON auth.identities.user_id = auth.users.id
        WHERE auth.users.email = ${email}
      `);
      const providers = identityCheck.map((row: any) => row.provider);
      if (providers.includes("google")) {
        return sendError(res, 409, "email_linked_to_google");
      }
    } catch (err) {
      console.error("Failed to check auth.identities directly:", err);
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          user_name: username,
          full_name: full_name,
        },
        emailRedirectTo: `${CLIENT_URL}/auth/callback`,
      },
    });

    if (error) {
      if (
        error.message.toLowerCase().includes("already registered") ||
        error.message.toLowerCase().includes("already exists")
      ) {
        return sendError(res, 409, "email_exists");
      }
      return sendError(res, error.status || 400, error.message);
    }

    if (data.user) {
      void mlService.onboardUserBestEffort({
        user_id: data.user.id,
        username,
        full_name,
        bio: typeof data.user.user_metadata?.bio === "string" ? data.user.user_metadata.bio : null,
        interests: [],
        skills: [],
        tech_stack: [],
      });
    }

    if (process.env.NODE_ENV === "development") {
      await supabaseAdmin.auth.admin.updateUserById(data.user!.id, {
        email_confirm: true,
      });
    } else if (!data.session) {
      return sendSuccess(res, 202, {
        message: "Signup successful! Please check your email to verify your account.",
        user: data.user,
      });
    }

    const userId = data.user!.id;
    const accessToken = jwt.sign({ userId, email }, JWT_SECRET, {
      expiresIn: "15m",
    });

    const refreshToken = await createAndStoreRefreshToken(userId);
    res.cookie("refresh_token", refreshToken, getRefreshCookieOptions());

    return sendSuccess(res, 201, {
      message: "Signup successful",
      accessToken,
      token: accessToken,
      user: data.user,
    });
  } catch (error) {
    sendControllerError(res, error as Error);
  }
}

export async function exchangeAuthCode(req: Request, res: Response): Promise<void> {
  const { code, supabaseToken } = req.body;
  if (supabaseToken) {
    try {
      const { data: authData, error } = await supabaseAdmin.auth.getUser(supabaseToken);
      if (error || !authData?.user) {
        return sendError(res, 401, "Invalid Supabase token");
      }

      const userId = authData.user.id;
      const email = authData.user.email;

      void mlService.onboardUserBestEffort({
        user_id: userId,
        username: typeof authData.user.user_metadata?.user_name === "string" ? authData.user.user_metadata.user_name : "",
        full_name: typeof authData.user.user_metadata?.full_name === "string" ? authData.user.user_metadata.full_name : "",
        bio: typeof authData.user.user_metadata?.bio === "string" ? authData.user.user_metadata.bio : null,
        interests: [],
        skills: [],
        tech_stack: [],
      });

      const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "15m" });
      const refreshToken = await createAndStoreRefreshToken(userId);
      res.cookie("refresh_token", refreshToken, getRefreshCookieOptions());

      return sendSuccess(res, 200, {
        accessToken: token,
        token: token,
        user: authData.user
      });
    } catch (error) {
      return sendControllerError(res, error as Error);
    }
  }

  if (!code) return sendError(res, 400, "Authorization code is required");
  if (!isValidUuid(code)) return sendError(res, 400, "Invalid authorization code format");

  try {
    const [codeData] = await db.delete(oauthCodes).where(eq(oauthCodes.code, code)).returning({
      user_id: oauthCodes.user_id,
      expires_at: oauthCodes.expires_at,
    });

    if (!codeData) return sendError(res, 400, "Invalid or already consumed authorization code");
    if (new Date(codeData.expires_at) < new Date()) return sendError(res, 400, "Authorization code expired");

    const userId = codeData.user_id;
    const { data: authData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !authData?.user) return sendError(res, 404, "User not found");

    const email = authData.user.email;

    void mlService.onboardUserBestEffort({
      user_id: userId,
      username: typeof authData.user.user_metadata?.user_name === "string" ? authData.user.user_metadata.user_name : "",
      full_name: typeof authData.user.user_metadata?.full_name === "string" ? authData.user.user_metadata.full_name : "",
      bio: typeof authData.user.user_metadata?.bio === "string" ? authData.user.user_metadata.bio : null,
      interests: [],
      skills: [],
      tech_stack: [],
    });

    const token = jwt.sign({ userId, email }, JWT_SECRET, { expiresIn: "15m" });
    const refreshToken = crypto.randomBytes(40).toString("hex");
    const tokenHash = hashToken(refreshToken);

    const newExpiresAt = new Date(Date.now() + REFRESH_TOKEN_DURATION_MS);
    await db.insert(refreshTokens).values({
      user_id: userId,
      refresh_token_hash: tokenHash,
      expires_at: newExpiresAt.toISOString(),
    });

    res.cookie("refresh_token", refreshToken, getRefreshCookieOptions());

    return sendSuccess(res, 200, {
      accessToken: token,
      token: token,
      user: authData.user,
    });
  } catch (error) {
    sendControllerError(res, error as Error);
  }
}
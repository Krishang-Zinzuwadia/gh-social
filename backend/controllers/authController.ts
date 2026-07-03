import crypto from "crypto";
import { eq, sql } from "drizzle-orm";
import type { CookieOptions, Request, Response } from "express";
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

// Helper: standard cookie options for refresh tokens
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

// Helper: Hash the refresh token before storing it
const hashToken = (token: string) => {
  return crypto.createHash("sha256").update(token).digest("hex");
};

// Helper: Create and store a refresh token securely
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

// POST /api/auth/signup
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
        bio:
          typeof data.user.user_metadata?.bio === "string"
            ? data.user.user_metadata.bio
            : null,
        interests: [],
        skills: [],
        tech_stack: [],
      });
    }

    if (process.env.NODE_ENV === "development") {
      const userId = data.user!.id;
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        email_confirm: true,
      });
    } else if (!data.session) {
      return sendSuccess(res, 202, {
        message:
          "Signup successful! Please check your email to verify your account.",
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

// POST /api/auth/login
export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) return sendError(res, error.status || 401, error.message);

    const userId = data.user.id;
    const accessToken = jwt.sign({ userId, email }, JWT_SECRET, {
      expiresIn: "15m",
    });
    const refreshToken = await createAndStoreRefreshToken(userId);

    res.cookie("refresh_token", refreshToken, getRefreshCookieOptions());

    return sendSuccess(res, 200, {
      message: "Login successful",
      accessToken,
      token: accessToken,
      user: data.user,
    });
  } catch (error) {
    sendControllerError(res, error as Error);
  }
}

// POST /api/auth/logout
export async function logout(req: Request, res: Response): Promise<void> {
  const incomingToken = req.cookies.refresh_token;
  if (!incomingToken) {
    res.status(200).json({ success: true, message: "Already logged out." });
    return;
  }

  try {
    const tokenHash = hashToken(incomingToken);

    try {
      await db
        .delete(refreshTokens)
        .where(eq(refreshTokens.refresh_token_hash, tokenHash));
    } catch (dbError) {
      return sendError(res, 500, "Failed to revoke refresh token.");
    }

    const { maxAge, ...clearOptions } = getRefreshCookieOptions();
    res.clearCookie("refresh_token", clearOptions);

    res
      .status(200)
      .json({ success: true, message: "Logged out successfully." });
  } catch (err) {
    return sendError(res, 500, "Internal server error during logout");
  }
}

// POST /api/auth/refresh
export async function refreshToken(req: Request, res: Response): Promise<void> {
  const incomingToken = req.cookies.refresh_token;
  if (!incomingToken) {
    return sendError(res, 401, "No refresh token provided.");
  }

  try {
    const tokenHash = hashToken(incomingToken);

    const [tokenData] = await db
      .select({
        user_id: refreshTokens.user_id,
        expires_at: refreshTokens.expires_at,
        is_revoked: refreshTokens.is_revoked,
      })
      .from(refreshTokens)
      .where(eq(refreshTokens.refresh_token_hash, tokenHash))
      .limit(1);

    if (!tokenData || tokenData.is_revoked) {
      throw new Error("InvalidToken");
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      throw new Error("ExpiredToken");
    }

    const { data: authData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(tokenData.user_id);
    if (userError || !authData?.user) {
      throw new Error("UserNotFound");
    }

    const newAccessToken = jwt.sign(
      { userId: authData.user.id, email: authData.user.email },
      JWT_SECRET,
      { expiresIn: "15m" },
    );

    const newRefreshToken = await db.transaction(async (tx) => {
      const deletedTokens = await tx
        .delete(refreshTokens)
        .where(eq(refreshTokens.refresh_token_hash, tokenHash))
        .returning();

      if (deletedTokens.length === 0) {
        throw new Error("InvalidToken");
      }
      return await createAndStoreRefreshToken(authData.user.id, tx);
    });

    res.cookie("refresh_token", newRefreshToken, getRefreshCookieOptions());
    return sendSuccess(res, 200, {
      accessToken: newAccessToken,
      token: newAccessToken,
      user: authData.user,
    });
  } catch (error: any) {
    if (error.message === "InvalidToken" || error.message === "ExpiredToken") {
      const { maxAge, ...clearOptions } = getRefreshCookieOptions();
      res.clearCookie("refresh_token", clearOptions);
      return sendError(
        res,
        401,
        "Invalid or expired refresh token. Please log in again.",
      );
    }
    if (error.message === "UserNotFound") {
      return sendError(res, 404, "User not found in Auth system.");
    }
    sendControllerError(res, error as Error);
  }
}

// GET /api/auth/:provider
export async function getOAuthUrl(req: Request, res: Response): Promise<void> {
  const { provider } = req.params;
  const { redirectUri, intent } = req.query;

  if (provider !== "github" && provider !== "google")
    return sendError(res, 400, "Invalid provider.");

  try {
    const url = new URL(`${process.env.SUPABASE_URL}/auth/v1/authorize`);
    url.searchParams.set("provider", provider);
    if (provider === "google") {
      url.searchParams.set("prompt", "select_account");
    }

    let redirectTo = redirectUri
      ? (redirectUri as string)
      : `${BACKEND_URL}/api/auth/callback`;

    let isAllowedRedirect = false;
    if (redirectTo[0] === "/" && redirectTo[1] === "/") {
      isAllowedRedirect = false;
    } else {
      try {
        const parsedUrl = new URL(redirectTo, BACKEND_URL);
        const parsedClient = new URL(CLIENT_URL!);
        const parsedBackend = new URL(BACKEND_URL!);

        if (
          parsedUrl.origin === parsedClient.origin ||
          parsedUrl.origin === parsedBackend.origin
        ) {
          isAllowedRedirect = true;
        } else {
          const SUPPORTED_NATIVE_SCHEMES = ["exp:", "ghsocial:"];
          if (SUPPORTED_NATIVE_SCHEMES.includes(parsedUrl.protocol)) {
            isAllowedRedirect =
              parsedUrl.pathname === "/auth/callback" ||
              parsedUrl.pathname.endsWith("/--/auth/callback");
          }
        }
      } catch (e) {
        isAllowedRedirect = false;
      }
    }

    if (!isAllowedRedirect) {
      return sendError(res, 400, "Invalid redirect URI. Domain not allowed.");
    }

    if (intent) {
      const separator = redirectTo.includes("?") ? "&" : "?";
      redirectTo += `${separator}intent=${intent}`;
    }

    url.searchParams.set("redirect_to", redirectTo);
    return sendSuccess(res, 200, { url: url.toString() });
  } catch (error) {
    sendControllerError(res, error as Error);
  }
}

// GET /api/auth/callback
export async function handleOAuthCallback(
  req: Request,
  res: Response,
): Promise<void> {
  const code = req.query.code as string;
  if (!code) {
    const reason = (req.query.error as string) || "no_code";
    return res.redirect(
      `${CLIENT_URL}/auth/callback?error=${encodeURIComponent(reason)}`,
    );
  }

  try {
    const { data, error } =
      await supabaseAdmin.auth.exchangeCodeForSession(code);
    if (error || !data.user) {
      console.error("OAuth Exchange Error:", error);
      return res.redirect(
        `${CLIENT_URL}/auth/callback?error=Authentication failed`,
      );
    }

    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const [codeData] = await db
      .insert(oauthCodes)
      .values({
        user_id: data.user.id,
        expires_at: expiresAt.toISOString(),
      })
      .returning({ code: oauthCodes.code });

    if (!codeData) {
      console.error("OAuth Code Insert Error");
      return res.redirect(
        `${CLIENT_URL}/auth/callback?error=Failed to generate auth code`,
      );
    }

    res.redirect(`${CLIENT_URL}/auth/callback?code=${codeData.code}`);
  } catch (error) {
    console.error("OAuth Callback Caught Error:", error);
    res.redirect(`${CLIENT_URL}/auth/callback?error=Internal server error`);
  }
}

// POST /api/auth/exchange
export async function exchangeAuthCode(
  req: Request,
  res: Response,
): Promise<void> {
  const { code, supabaseToken } = req.body;

  if (supabaseToken) {
    try {
      const { data: authData, error } =
        await supabaseAdmin.auth.getUser(supabaseToken);
      if (error || !authData?.user) {
        return sendError(res, 401, "Invalid Supabase token");
      }

      const userId = authData.user.id;
      const email = authData.user.email;

      void mlService.onboardUserBestEffort({
        user_id: userId,
        username:
          typeof authData.user.user_metadata?.user_name === "string"
            ? authData.user.user_metadata.user_name
            : "",
        full_name:
          typeof authData.user.user_metadata?.full_name === "string"
            ? authData.user.user_metadata.full_name
            : "",
        bio:
          typeof authData.user.user_metadata?.bio === "string"
            ? authData.user.user_metadata.bio
            : null,
        interests: [],
        skills: [],
        tech_stack: [],
      });

      const token = jwt.sign({ userId, email }, JWT_SECRET, {
        expiresIn: "15m",
      });
      const refreshToken = await createAndStoreRefreshToken(userId);
      res.cookie("refresh_token", refreshToken, getRefreshCookieOptions());

      return sendSuccess(res, 200, {
        accessToken: token,
        token: token,
        user: authData.user,
      });
    } catch (error) {
      return sendControllerError(res, error as Error);
    }
  }

  if (!code) return sendError(res, 400, "Authorization code is required");
  if (!isValidUuid(code))
    return sendError(res, 400, "Invalid authorization code format");

  try {
    const [codeData] = await db
      .delete(oauthCodes)
      .where(eq(oauthCodes.code, code))
      .returning({
        user_id: oauthCodes.user_id,
        expires_at: oauthCodes.expires_at,
      });

    if (!codeData)
      return sendError(
        res,
        400,
        "Invalid or already consumed authorization code",
      );
    if (new Date(codeData.expires_at) < new Date())
      return sendError(res, 400, "Authorization code expired");

    const userId = codeData.user_id;
    const { data: authData, error: userError } =
      await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !authData?.user)
      return sendError(res, 404, "User not found");

    const email = authData.user.email;

    void mlService.onboardUserBestEffort({
      user_id: userId,
      username:
        typeof authData.user.user_metadata?.user_name === "string"
          ? authData.user.user_metadata.user_name
          : "",
      full_name:
        typeof authData.user.user_metadata?.full_name === "string"
          ? authData.user.user_metadata.full_name
          : "",
      bio:
        typeof authData.user.user_metadata?.bio === "string"
          ? authData.user.user_metadata.bio
          : null,
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

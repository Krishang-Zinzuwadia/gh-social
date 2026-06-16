import type { Request, Response } from 'express';
import supabase, { supabaseAdmin } from '../config/supabase.js'; 
import crypto from 'crypto';
import { sendError, sendSuccess, sendControllerError } from '../utils/response.js';
import { isValidUuid } from '../utils/validators.js';
import { db } from '../db/index.js';
import { refreshTokens, oauthCodes } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import jwt from 'jsonwebtoken';

const CLIENT_URL = process.env.CLIENT_URL;
const BACKEND_URL = process.env.BACKEND_URL;

if (!CLIENT_URL) throw new Error('Missing required environment variable: CLIENT_URL');
if (!BACKEND_URL) throw new Error('Missing required environment variable: BACKEND_URL');

const JWT_SECRET = process.env.JWT_SECRET as string;

if (!JWT_SECRET) {
  throw new Error('FATAL ERROR: JWT_SECRET is not defined in environment variables.');
}

// Helper: Hash the refresh token before storing it
const hashToken = (token: string) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Helper: Create and store a refresh token securely
const createAndStoreRefreshToken = async (userId: string) => {
  const refreshToken = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(refreshToken);
  
  // Expiration set to 30 days
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  await db.insert(refreshTokens).values({
    user_id: userId,
    refresh_token_hash: tokenHash,
    expires_at: expiresAt.toISOString()
  });

  return refreshToken;
};

// POST /api/auth/signup
export async function signUp(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return sendError(res, error.status || 400, error.message);

    if (!data.session) {
      return sendSuccess(res, 202, { 
        message: 'Signup successful! Please check your email to verify your account.',
        user: data.user 
      });
    }

    const userId = data.user!.id;

    // 1. Generate Custom JWT Access Token
    const accessToken = jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    // 2. Generate and store Refresh Token securely using Drizzle
    const refreshToken = await createAndStoreRefreshToken(userId);

    // 3. Set refresh token in HTTP-only cookie
    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth', // Restrict cookie to refresh endpoint
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    });

    return sendSuccess(res, 201, {
      message: 'Signup successful',
      accessToken,
      token: accessToken, // Alias for backward compatibility
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

    const accessToken = jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = await createAndStoreRefreshToken(userId);

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, 200, {
      message: 'Login successful',
      accessToken,
      token: accessToken, // Alias for backward compatibility
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
    res.status(200).json({ success: true, message: 'Already logged out.' });
    return;
  }

  res.clearCookie('refresh_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/api/auth',
  });

  try {
    const tokenHash = hashToken(incomingToken);
    
    try {
      await db.delete(refreshTokens).where(eq(refreshTokens.refresh_token_hash, tokenHash));
    } catch (dbError) {
      return sendError(res, 500, 'Failed to revoke refresh token.');
    }
    
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    // If it fails, we still cleared the cookie, so the user is effectively logged out
    res.status(200).json({ success: true, message: 'Logged out locally.' });
  }
}

// POST /api/auth/refresh
export async function refreshToken(req: Request, res: Response): Promise<void> {
  const incomingToken = req.cookies.refresh_token;

  if (!incomingToken) {
    return sendError(res, 401, 'No refresh token provided.');
  }

  try {
    const tokenHash = hashToken(incomingToken);

    // 1. Look up the hash in the DB
    const [tokenData] = await db.select({
      user_id: refreshTokens.user_id,
      expires_at: refreshTokens.expires_at,
      is_revoked: refreshTokens.is_revoked
    }).from(refreshTokens).where(eq(refreshTokens.refresh_token_hash, tokenHash)).limit(1);

    if (!tokenData || tokenData.is_revoked) {
      // SECURITY RISK: Token reuse detected or invalid token. 
      // If we wanted to be extremely secure, we would revoke ALL tokens for this user here.
      res.clearCookie('refresh_token', { path: '/api/auth' });
      return sendError(res, 401, 'Invalid or revoked refresh token. Please log in again.');
    }

    if (new Date(tokenData.expires_at) < new Date()) {
      res.clearCookie('refresh_token', { path: '/api/auth' });
      return sendError(res, 401, 'Refresh token has expired. Please log in again.');
    }

    // 2. Fetch user metadata from Supabase Auth via Admin Client (Secure, bypasses RLS)
    const { data: authData, error: userError } = await supabaseAdmin.auth.admin.getUserById(tokenData.user_id);

    if (userError || !authData?.user) return sendError(res, 404, 'User not found in Auth system.');

    // 3. Generate a fresh access token AND a fresh refresh token first
    const newAccessToken = jwt.sign(
      { userId: authData.user.id, email: authData.user.email },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const newRefreshToken = await createAndStoreRefreshToken(authData.user.id);

    // 4. Delete the old token ONLY after the new one is successfully stored
    try {
      await db.delete(refreshTokens).where(eq(refreshTokens.refresh_token_hash, tokenHash));
    } catch (dbError) {
      // It's safe to just log this; the new token works, and the old one will expire anyway
      console.error('Failed to delete old refresh token:', dbError);
    }

    // 5. Send new refresh token in cookie
    res.cookie('refresh_token', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000, 
    });

    return sendSuccess(res, 200, {
      accessToken: newAccessToken,
      token: newAccessToken, // Alias for backward compatibility
      user: authData.user,
    });

  } catch (error) {
    sendControllerError(res, error as Error);
  }
}

// GET /api/auth/:provider
export async function getOAuthUrl(req: Request, res: Response): Promise<void> {
  const { provider } = req.params;
  if (provider !== 'github' && provider !== 'google') return sendError(res, 400, 'Invalid provider.');

  try {
    const url = new URL(`${process.env.SUPABASE_URL}/auth/v1/authorize`);
    url.searchParams.set('provider', provider);
    url.searchParams.set('redirect_to', `${BACKEND_URL}/api/auth/callback`);

    return sendSuccess(res, 200, { url: url.toString() });
  } catch (error) {
    sendControllerError(res, error as Error);
  }
}

// GET /api/auth/callback
export async function handleOAuthCallback(req: Request, res: Response): Promise<void> {
  const code = req.query.code as string;
  
  if (!code) {
    const reason = (req.query.error as string) || 'no_code';
    return res.redirect(`${CLIENT_URL}/auth/callback?error=${encodeURIComponent(reason)}`);
  }

  try {
    // 1. Exchange the provider code for a Supabase session using the Admin client
    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      console.error('OAuth Exchange Error:', error);
      return res.redirect(`${CLIENT_URL}/auth/callback?error=Authentication failed`);
    }

    // 2. Insert a short-lived (5 minute) authorization code into the DB using Drizzle
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const [codeData] = await db.insert(oauthCodes).values({
      user_id: data.user.id,
      expires_at: expiresAt.toISOString()
    }).returning({ code: oauthCodes.code });

    if (!codeData) {
      console.error('OAuth Code Insert Error');
      return res.redirect(`${CLIENT_URL}/auth/callback?error=Failed to generate auth code`);
    }

    // 3. Redirect to your frontend with the short-lived code
    res.redirect(`${CLIENT_URL}/auth/callback?code=${codeData.code}`);
  } catch (error) {
    console.error('OAuth Callback Caught Error:', error);
    res.redirect(`${CLIENT_URL}/auth/callback?error=Internal server error`);
  }
}

// POST /api/auth/exchange
export async function exchangeAuthCode(req: Request, res: Response): Promise<void> {
  const { code } = req.body;

  if (!code) {
    return sendError(res, 400, 'Authorization code is required');
  }

  if (!isValidUuid(code)) {
    return sendError(res, 400, 'Invalid authorization code format');
  }

  try {
    // 1. Look up the code
    const [codeData] = await db.select({
      user_id: oauthCodes.user_id,
      expires_at: oauthCodes.expires_at
    }).from(oauthCodes).where(eq(oauthCodes.code, code)).limit(1);

    if (!codeData) {
      return sendError(res, 400, 'Invalid authorization code');
    }

    // 2. Delete the code immediately (one-time use)
    try {
      await db.delete(oauthCodes).where(eq(oauthCodes.code, code));
    } catch (dbError) {
      return sendError(res, 500, 'Failed to consume authorization code. Please try again.');
    }

    // 3. Check expiration
    if (new Date(codeData.expires_at) < new Date()) {
      return sendError(res, 400, 'Authorization code expired');
    }

    const userId = codeData.user_id;

    // 4. Look up user email
    const { data: authData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !authData?.user) {
      return sendError(res, 404, 'User not found');
    }

    const email = authData.user.email;

    // 5. Mint tokens
    const token = jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = hashToken(refreshToken);

    const newExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await db.insert(refreshTokens).values({
      user_id: userId,
      refresh_token_hash: tokenHash,
      expires_at: newExpiresAt.toISOString()
    });

    res.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/api/auth',
      maxAge: 30 * 24 * 60 * 60 * 1000,
    });

    return sendSuccess(res, 200, {
      accessToken: token,
      token: token, // Alias for backward compatibility
      user: authData.user,
    });
  } catch (error) {
    sendControllerError(res, error as Error);
  }
}
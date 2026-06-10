import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';
import crypto from 'crypto';
import { sendError, sendSuccess, sendControllerError } from '../utils/response.js';

const JWT_SECRET = process.env.JWT_SECRET as string;

// Helper to hash tokens
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

// HELPER: Generate, hash, and store a new 30-day refresh token
const createAndStoreRefreshToken = async (userId: string) => {
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = hashToken(rawToken);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // Valid for 30 days

  const { error } = await supabase.from('refresh_tokens').insert({
    user_id: userId,
    refresh_token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  if (error) throw error;
  return rawToken;
};

export async function signUp(req: Request, res: Response): Promise<void> {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return sendError(res, 400, 'Email, password, and username are required.');
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } }
    });

    if (error || !data.user) return sendError(res, 400, error?.message || 'Signup failed');

    if (!data.session) {
      return sendSuccess(res, 202, { 
        message: 'Signup successful! Please check your email to verify your account.',
        user: data.user 
      });
    }

    // Mint access token AND generate refresh token
    const token = jwt.sign({ userId: data.user.id, email: data.user.email }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = await createAndStoreRefreshToken(data.user.id);

    return sendSuccess(res, 201, { user: data.user, token, refreshToken });
  } catch (err) {
    return sendControllerError(res, err as Error);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) return sendError(res, 400, 'Email and password are required.');

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) return sendError(res, 401, 'Invalid login credentials.');

    // Mint access token AND generate refresh token
    const token = jwt.sign({ userId: data.user.id, email: data.user.email }, JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = await createAndStoreRefreshToken(data.user.id);

    return sendSuccess(res, 200, { user: data.user, token, refreshToken });
  } catch (err) {
    return sendControllerError(res, err as Error);
  }
}

export async function getOAuthUrl(req: Request, res: Response): Promise<void> {
  const { provider } = req.params;
  if (provider !== 'github' && provider !== 'google') return sendError(res, 400, 'Invalid provider.');

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${process.env.CLIENT_URL}/auth/callback` },
    });

    if (error) return sendError(res, 500, 'Failed to initialize OAuth.');
    return sendSuccess(res, 200, { url: data.url });
  } catch (err) {
    return sendControllerError(res, err as Error);
  }
}

export async function logout(req: Request, res: Response): Promise<void> { 
  const { refreshToken } = req.body;

  // SECURITY FIX: Delete the session from the database
  if (refreshToken) {
    try {
      const tokenHash = hashToken(refreshToken);
      await supabase.from('refresh_tokens').delete().eq('refresh_token_hash', tokenHash);
    } catch (err) {
      console.error('Failed to delete refresh token on logout:', err);
    }
  }

  res.status(200).json({ success: true, message: 'Logged out successfully.' });
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken: currentToken } = req.body;
  if (!currentToken) return sendError(res, 400, 'Refresh token required.');

  try {
    const tokenHash = hashToken(currentToken);
    
    // 1. Validate existing token
    const { data: storedToken, error } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('refresh_token_hash', tokenHash)
      .single();

    if (error || !storedToken || storedToken.is_revoked || new Date() > new Date(storedToken.expires_at)) {
      return sendError(res, 403, 'Invalid or expired token.');
    }

    // 2. SECURITY FIX: Fetch user email securely from Supabase Auth admin API
    const { data: authData, error: userError } = await supabase.auth.admin.getUserById(storedToken.user_id);

    if (userError || !authData?.user) return sendError(res, 404, 'User not found in Auth system.');

    // 3. Delete the old token (Token Rotation)
    await supabase.from('refresh_tokens').delete().eq('refresh_token_hash', tokenHash);

    // 4. Generate a fresh access token (now with email) AND a fresh refresh token
    const newAccessToken = jwt.sign(
      { userId: storedToken.user_id, email: authData.user.email }, 
      JWT_SECRET, 
      { expiresIn: '15m' }
    );
    const newRefreshToken = await createAndStoreRefreshToken(storedToken.user_id);
    
    return sendSuccess(res, 200, { token: newAccessToken, refreshToken: newRefreshToken });
  } catch (err) {
    return sendControllerError(res, err as Error);
  }
}
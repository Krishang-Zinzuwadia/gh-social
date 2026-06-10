import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js';
import crypto from 'crypto';
import { sendError, sendSuccess, sendControllerError } from '../utils/response.js';

// Ensure the secret is available
const JWT_SECRET = process.env.JWT_SECRET as string;
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

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

    // SECURITY FIX: Check if email confirmation is pending
    // Supabase returns null for data.session if they need to verify their email
    if (!data.session) {
      return sendSuccess(res, 202, { 
        message: 'Signup successful! Please check your email to verify your account.',
        user: data.user 
      });
    }

    // Mint custom stateless JWT (only runs if verified or confirmation is disabled)
    const token = jwt.sign({ userId: data.user.id, email: data.user.email }, JWT_SECRET, { expiresIn: '15m' });

    return sendSuccess(res, 201, { user: data.user, token });
  } catch (err) {
    return sendControllerError(res, err as Error);
  }
}

export async function login(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;

  if (!email || !password) {
    return sendError(res, 400, 'Email and password are required.');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) return sendError(res, 401, 'Invalid login credentials.');

    // Mint custom stateless JWT
    const token = jwt.sign({ userId: data.user.id, email: data.user.email }, JWT_SECRET, { expiresIn: '15m' });

    return sendSuccess(res, 200, { user: data.user, token });
  } catch (err) {
    return sendControllerError(res, err as Error);
  }
}

export async function getOAuthUrl(req: Request, res: Response): Promise<void> {
  const { provider } = req.params;
  
  if (provider !== 'github' && provider !== 'google') {
    return sendError(res, 400, 'Invalid provider.');
  }

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
  // The frontend simply deletes the token from storage.
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken } = req.body;
  if (!refreshToken) return sendError(res, 400, 'Refresh token required.');

  try {
    const tokenHash = hashToken(refreshToken);
    const { data: storedToken, error } = await supabase
      .from('refresh_tokens')
      .select('*')
      .eq('refresh_token_hash', tokenHash)
      .single();

    if (error || !storedToken || new Date() > new Date(storedToken.expires_at)) {
      return sendError(res, 403, 'Invalid or expired token.');
    }

    // Issue a fresh 15-minute access token
    const newAccessToken = jwt.sign(
      { userId: storedToken.user_id }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '15m' }
    );
    
    return sendSuccess(res, 200, { token: newAccessToken });
  } catch (err) {
    return sendControllerError(res, err as Error);
  }
}
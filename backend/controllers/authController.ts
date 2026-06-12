import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import supabase from '../config/supabase.js'; // Normal client for public/anon actions
import { createClient } from '@supabase/supabase-js'; // To create our Admin client
import crypto from 'crypto';
import { sendError, sendSuccess, sendControllerError } from '../utils/response.js';

const JWT_SECRET = process.env.JWT_SECRET as string;


interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

// SECURITY FIX: Create a dedicated Admin client to securely bypass RLS
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL as string,
  process.env.SUPABASE_SERVICE_ROLE_KEY as string
);

// Helper to hash tokens
const hashToken = (token: string) => crypto.createHash('sha256').update(token).digest('hex');

// HELPER: Generate, hash, and store a new 30-day refresh token
const createAndStoreRefreshToken = async (userId: string) => {
  const rawToken = crypto.randomBytes(64).toString('hex');
  const tokenHash = hashToken(rawToken);
  
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // Valid for 30 days

  // SECURITY FIX: Use Admin client to bypass RLS for insertion
  const { error } = await supabaseAdmin.from('refresh_tokens').insert({
    user_id: userId,
    refresh_token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  });

  if (error) throw error;
  return rawToken;
};

export async function signUp(req: Request, res: Response): Promise<void> {
  const { email, password, username, full_name, date_of_birth, github_url, bio } = req.body;

  if (!email || !password || !username) {
    return sendError(res, 400, 'Email, password, and username are required.');
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          user_name: username, 
          full_name,
          date_of_birth,
          github_url,
          bio
        } 
      }
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
      options: { redirectTo: `${process.env.BACKEND_URL}/api/auth/callback` },
    });

    if (error) return sendError(res, 500, 'Failed to initialize OAuth.');
    return sendSuccess(res, 200, { url: data.url });
  } catch (err) {
    return sendControllerError(res, err as Error);
  }
}

export async function logout(req: AuthRequest, res: Response): Promise<void> { 
  const { refreshToken } = req.body;

  // SECURITY FIX: Reject logout if the token is missing entirely
  if (!refreshToken) {
    return sendError(res, 400, 'Refresh token required for logout.');
  }

  // SECURITY FIX: Ensure the auth middleware actually attached the user
  if (!req.user || !req.user.userId) {
    return sendError(res, 401, 'Unauthorized request.');
  }

  try {
    const tokenHash = hashToken(refreshToken);
    
    // SECURITY FIX: Use Admin client for deletion and chain .eq() to scope to authenticated user
    const { error: deleteError } = await supabaseAdmin
      .from('refresh_tokens')
      .delete()
      .eq('refresh_token_hash', tokenHash)
      .eq('user_id', req.user.userId); 

    if (deleteError) return sendError(res, 500, 'An error occurred during logout.');
    
    res.status(200).json({ success: true, message: 'Logged out successfully.' });
  } catch (err) {
    console.error('Failed to delete refresh token on logout:', err);
    return sendError(res, 500, 'An error occurred during logout.');
  }
}

export async function refreshToken(req: Request, res: Response): Promise<void> {
  const { refreshToken: currentToken } = req.body;
  if (!currentToken) return sendError(res, 400, 'Refresh token required.');

  try {
    const tokenHash = hashToken(currentToken);
    
    // 1. Validate existing token (SECURITY FIX: Use Admin client)
    const { data: storedToken, error } = await supabaseAdmin
      .from('refresh_tokens')
      .select('*')
      .eq('refresh_token_hash', tokenHash)
      .single();

    // SECURITY FIX: Included the is_revoked check
    if (error || !storedToken || storedToken.is_revoked || new Date() > new Date(storedToken.expires_at)) {
      return sendError(res, 403, 'Invalid, expired, or revoked token.');
    }

    // 2. Fetch user email securely using the dedicated Admin API client
    const { data: authData, error: userError } = await supabaseAdmin.auth.admin.getUserById(storedToken.user_id);

    if (userError || !authData?.user) return sendError(res, 404, 'User not found in Auth system.');

    // 3. Delete the old token (SECURITY FIX: Use Admin client)
    await supabaseAdmin.from('refresh_tokens').delete().eq('refresh_token_hash', tokenHash);

    // 4. Generate a fresh access token AND a fresh refresh token
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

export async function handleOAuthCallback(req: Request, res: Response) {
  const code = req.query.code as string;
  
  if (!code) {
    return sendError(res, 400, "No code provided");
  }

  try {
    // 1. Exchange the code for the Supabase session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (error || !data.user) {
      return sendError(res, 400, error?.message || 'OAuth verification failed');
    }

    // 2. NOW: Mint YOUR OWN JWT and Refresh Token (exactly like you do in login())
    const token = jwt.sign(
      { userId: data.user.id, email: data.user.email }, 
      JWT_SECRET, 
      { expiresIn: '15m' }
    );
    
    const refreshToken = await createAndStoreRefreshToken(data.user.id);

    // 3. Redirect to your frontend with your custom tokens
    // Using a URL fragment (#) is more secure than query parameters for tokens
    res.redirect(`${process.env.CLIENT_URL}/auth/callback#token=${token}&refreshToken=${refreshToken}`);

  } catch (err) {
    return sendControllerError(res, err as Error);
  }
}
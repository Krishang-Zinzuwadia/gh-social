import type { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import supabase, { supabaseAdmin } from '../config/supabase.js'; 
import crypto from 'crypto';
import { sendError, sendSuccess, sendControllerError } from '../utils/response.js';

const JWT_SECRET = process.env.JWT_SECRET as string;
const BACKEND_URL = process.env.BACKEND_URL as string;
const CLIENT_URL = process.env.CLIENT_URL as string;

if (!BACKEND_URL || !CLIENT_URL) {
  throw new Error('FATAL ERROR: BACKEND_URL and CLIENT_URL must be defined in environment variables.');
}


interface AuthRequest extends Request {
  user?: { userId: string; email: string };
}

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
      options: { redirectTo: `${BACKEND_URL}/api/auth/callback` },
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
    const { error: deleteError } = await supabaseAdmin.from('refresh_tokens').delete().eq('refresh_token_hash', tokenHash);
    
    if (deleteError) {
      return sendError(res, 500, 'Failed to rotate refresh token. Please log in again.');
    }

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
    const { data, error } = await supabaseAdmin.auth.exchangeCodeForSession(code);
    
    if (error || !data.user) {
      return sendError(res, 400, error?.message || 'OAuth verification failed');
    }

    // 2. Insert a short-lived (5 minute) authorization code into the DB
    // SECURITY FIX: We don't send the tokens directly in the URL anymore.
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('oauth_codes')
      .insert([
        { 
          user_id: data.user.id, 
          expires_at: new Date(Date.now() + 5 * 60 * 1000).toISOString() 
        }
      ])
      .select('code')
      .single();

    if (codeError || !codeData) {
      console.error('OAuth Code Insert Error:', codeError);
      return res.redirect(`${CLIENT_URL}/auth/callback?error=Failed to generate auth code`);
    }

    // 3. Redirect to your frontend with the short-lived code
    res.redirect(`${CLIENT_URL}/auth/callback?code=${codeData.code}`);
  } catch (error) {
    console.error('OAuth Callback Error:', error);
    res.redirect(`${CLIENT_URL}/auth/callback?error=Internal server error`);
  }
}

// POST /api/auth/exchange
export async function exchangeAuthCode(req: Request, res: Response): Promise<void> {
  const { code } = req.body;

  if (!code) {
    return sendError(res, 400, 'Authorization code is required');
  }

  try {
    // 1. Look up the code
    const { data: codeData, error: codeError } = await supabaseAdmin
      .from('oauth_codes')
      .select('user_id, expires_at')
      .eq('code', code)
      .single();

    if (codeError || !codeData) {
      return sendError(res, 400, 'Invalid authorization code');
    }

    // 2. Delete the code immediately (one-time use)
    const { error: deleteError } = await supabaseAdmin.from('oauth_codes').delete().eq('code', code);

    if (deleteError) {
      return sendError(res, 500, 'Failed to consume authorization code. Please try again.');
    }

    // 3. Check expiration
    if (new Date(codeData.expires_at) < new Date()) {
      return sendError(res, 400, 'Authorization code expired');
    }

    const userId = codeData.user_id;

    // 4. Fetch the user's email to embed in the JWT
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId);
    if (userError || !userData?.user) {
      return sendError(res, 404, 'User not found');
    }

    const email = userData.user.email || '';

    // 5. Mint tokens
    const token = jwt.sign(
      { userId, email },
      JWT_SECRET,
      { expiresIn: '15m' }
    );

    const refreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = hashToken(refreshToken);

    const { error: insertError } = await supabaseAdmin.from('refresh_tokens').insert([
      {
        user_id: userId,
        refresh_token_hash: tokenHash,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]);

    if (insertError) {
      return sendError(res, 500, 'Failed to secure session');
    }

    // 6. Return tokens securely in the body
    return sendSuccess(res, 200, {
      user: userData.user,
      token,
      refreshToken
    });

  } catch (error) {
    sendControllerError(res, error as Error);
  }
}
import type { Request, Response } from 'express';
import supabase from '../config/supabase.js';
import { sendError, sendSuccess, sendControllerError } from '../utils/response.js';

export async function signUp(req: Request, res: Response): Promise<void> {
  const { email, password, username } = req.body;

  if (!email || !password || !username) {
    return sendError(res, 400, 'Email, password, and username are required.');
  }

  try {
    // We pass 'username' in user_metadata so the database trigger can catch it
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username } 
      }
    });

    if (error) return sendError(res, 400, error.message);
    return sendSuccess(res, 201, { user: data.user, session: data.session });
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) return sendError(res, 401, 'Invalid login credentials.');
    return sendSuccess(res, 200, { user: data.user, session: data.session });
  } catch (err) {
    return sendControllerError(res, err as Error);
  }
}

export async function getOAuthUrl(req: Request, res: Response): Promise<void> {
  const { provider } = req.params; // 'github' or 'google'
  
  if (provider !== 'github' && provider !== 'google') {
    return sendError(res, 400, 'Invalid provider. Must be github or google.');
  }

  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'http://localhost:3000/auth/callback', // Change to your frontend URL
      },
    });

    if (error) return sendError(res, 500, 'Failed to initialize OAuth.');
    
    // Return the generated URL so the frontend can redirect the user
    return sendSuccess(res, 200, { url: data.url });
  } catch (err) {
    return sendControllerError(res, err as Error);
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader) return sendError(res, 400, 'No session to log out from.');

  const token = authHeader.split(' ')[1];
  
  try {
    // Invalidate the session on Supabase's end
    const { error } = await supabase.auth.admin.signOut(token);
    if (error) return sendError(res, 500, 'Failed to log out cleanly.');
    
    res.status(204).send();
  } catch (err) {
    return sendControllerError(res, err as Error);
  }
}
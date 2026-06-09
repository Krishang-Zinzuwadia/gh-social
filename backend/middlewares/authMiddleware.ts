import type { Request, Response, NextFunction } from 'express';
import supabase from '../config/supabase.js';
import { sendError } from '../utils/response.js';
import type { User } from '@supabase/supabase-js';

// Extend the Express Request to include the Supabase user
export interface AuthRequest extends Request {
  user?: User;
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return sendError(res, 401, 'Authentication required. Missing Bearer token.');
  }

  const token = authHeader.split(' ')[1];

  // Validate the JWT with Supabase
  const { data, error } = await supabase.auth.getUser(token);

  if (error || !data.user) {
    return sendError(res, 401, 'Invalid or expired authentication token.');
  }

  // Attach the authenticated user to the request object
  req.user = data.user;
  
  next();
}
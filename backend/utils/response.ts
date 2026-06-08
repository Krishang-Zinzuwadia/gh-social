import type { Response } from 'express';
import type { PostgresError, SupabaseErrorOptions } from '../types/index.js';

export function sendSuccess<T>(res: Response, statusCode: number, data: T): void {
  res.status(statusCode).json({ success: true, data });
}

export function sendError(res: Response, statusCode: number, message: string): void {
  res.status(statusCode).json({ success: false, error: message });
}

export function sendControllerError(
  res: Response,
  err: unknown,
  fallbackStatusCode: number = 500
): void {
  if (err instanceof Error) {
    const statusCode = 'statusCode' in err ? (err as { statusCode: number }).statusCode : fallbackStatusCode;
    // Don't expose internal error details for 500s
    const message = statusCode >= 500 ? 'Internal server error' : err.message;
    sendError(res, statusCode, message);
  } else {
    sendError(res, fallbackStatusCode, 'An unexpected error occurred');
  }
}

export function sendSupabaseError(
  res: Response,
  error: PostgresError,
  options: SupabaseErrorOptions = {}
): void {
  const {
    notFoundMessage = 'Resource not found',
    conflictMessage = 'Resource already exists',
    missingRequiredMessage = 'Missing required fields',
    invalidReferenceMessage = 'Invalid reference',
    invalidFormatMessage = 'Invalid input format (e.g. invalid UUID)',
  } = options;

  switch (error.code) {
    case 'PGRST116':
      sendError(res, 404, notFoundMessage);
      break;
    case '23505':
      sendError(res, 409, conflictMessage);
      break;
    case '23502':
      sendError(res, 400, missingRequiredMessage);
      break;
    case '23503':
      sendError(res, 400, invalidReferenceMessage);
      break;
    case '22P02':
      sendError(res, 400, invalidFormatMessage);
      break;
    default:
      sendError(res, 500, error.message || 'Database error');
  }
}

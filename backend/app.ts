import express, { type Request, type Response, type NextFunction } from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import activityRoutes from './routes/activityRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import repoRoutes from './routes/repoRoutes.js';
import userRoutes from './routes/userRoutes.js';
import boardRoutes from './routes/boardRoutes.js';
import containersRoutes from './routes/containersRoutes.js';
import onboardingRoutes from './routes/onboardingRoutes.js';
import cookieParser from 'cookie-parser';
import feedRoutes from './routes/feedRoutes.js';

const app = express();

const configuredCorsOrigins = new Set(
  [
    ...(process.env.CORS_ORIGINS ?? '').split(','),
    process.env.CLIENT_URL?.startsWith('http') ? process.env.CLIENT_URL : '',
  ]
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean),
);

const isLocalDevelopmentOrigin = (origin: string): boolean => {
  if (process.env.NODE_ENV === 'production') return false;

  try {
    const url = new URL(origin);
    return (
      (url.protocol === 'http:' || url.protocol === 'https:') &&
      (url.hostname === 'localhost' ||
        url.hostname === '127.0.0.1' ||
        url.hostname === '10.0.2.2' ||
        url.hostname.startsWith('10.') ||
        url.hostname.startsWith('192.168.'))
    );
  } catch {
    return false;
  }
};

// Global middleware used by every route.
app.use(
  cors({
    // Native requests do not send an Origin header. Browser origins must be
    // explicitly configured in production; local/LAN origins are allowed in dev.
    origin: (origin, callback) => {
      const normalizedOrigin = origin?.replace(/\/$/, '');
      if (
        !normalizedOrigin ||
        configuredCorsOrigins.has(normalizedOrigin) ||
        isLocalDevelopmentOrigin(normalizedOrigin)
      ) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS origin is not allowed: ${normalizedOrigin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

// Basic health route to confirm the backend is running.
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'GH Social backend is running' });
});

// Auth API routes 
app.use('/api/auth', authRoutes);

// Activity API routes.
app.use('/api/activity', activityRoutes);

// Comment API routes.
app.use('/api/comment', commentRoutes);

// Repository API routes.
app.use('/api/repos', repoRoutes);

// User API routes.
app.use('/api/users', userRoutes);

// Board API routes.
app.use('/api/boards', boardRoutes);

// Container API routes.
app.use('/api/containers', containersRoutes);

// Onboarding API routes.
app.use('/api/onboarding', onboardingRoutes);

// Redis API routes.
app.use('/api', feedRoutes);

// Global error handler.
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

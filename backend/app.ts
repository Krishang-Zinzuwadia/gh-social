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
import feedV2Routes from './routes/feedV2Routes.js';
import activityV2Routes from './routes/activityV2Routes.js';
import ingestionRoutes from './routes/ingestionRoutes.js';
import operationsRoutes from './routes/operationsRoutes.js';
import productV2Routes from './routes/productV2Routes.js';
import { readiness } from './controllers/operationsController.js';
import { requestTelemetry } from './middlewares/requestTelemetryMiddleware.js';
import { authRateLimit, securityHeaders } from './middlewares/securityMiddleware.js';

const app = express();
app.disable('x-powered-by');
if (process.env.TRUST_PROXY === 'true') app.set('trust proxy', 1);

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
app.use(express.json({ limit: '256kb' }));
app.use(cookieParser());
app.use(securityHeaders);
app.use(requestTelemetry);

// Basic health route to confirm the backend is running.
app.get('/', (_req: Request, res: Response) => {
  res.json({ message: 'GH Social backend is running' });
});
app.get('/healthz', (_req: Request, res: Response) => res.status(200).json({ healthy: true }));
app.get('/readyz', readiness);

// Auth API routes 
app.use('/api/auth', authRateLimit, authRoutes);

// Activity API routes.
if (process.env.LEGACY_API_ENABLED === 'true') {
  app.use('/api/activity', activityRoutes);
  app.use('/api/comment', commentRoutes);
  app.use('/api/repos', repoRoutes);
  app.use('/api/users', userRoutes);
  app.use('/api/boards', boardRoutes);
  app.use('/api/containers', containersRoutes);
  app.use('/api/onboarding', onboardingRoutes);
  app.use('/api', feedRoutes);
}

// Contract-v2 routes are deployed dark and are controlled by rollout flags.
app.use('/api/v2', feedV2Routes);
app.use('/api/v2', activityV2Routes);
app.use('/api/v2', productV2Routes);
app.use('/api/internal/v2/ingestion', ingestionRoutes);
app.use('/api/internal/v2/operations', operationsRoutes);

// Global error handler.
app.use((err: Error & { type?: string }, _req: Request, res: Response, _next: NextFunction) => {
  if (err.type === 'entity.too.large') {
    res.status(413).json({ error: 'Request payload exceeds 256 KB.' });
    return;
  }
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

export default app;

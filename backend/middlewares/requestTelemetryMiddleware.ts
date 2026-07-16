import crypto from 'node:crypto';
import type { NextFunction, Request, Response } from 'express';

import { incrementMetric, observeMetric } from '../observability/metrics.js';

export function requestTelemetry(req: Request, res: Response, next: NextFunction): void {
  const supplied = req.header('x-request-id');
  const requestId = supplied && supplied.length <= 128 ? supplied : crypto.randomUUID();
  const started = process.hrtime.bigint();
  res.setHeader('x-request-id', requestId);
  res.on('finish', () => {
    const elapsedMs = Number(process.hrtime.bigint() - started) / 1_000_000;
    const route = `${req.baseUrl}${req.route?.path ?? req.path}`;
    const labels = { method: req.method, route, status: String(res.statusCode) };
    incrementMetric('http_requests_total', labels);
    observeMetric('http_request_duration_ms', elapsedMs, { method: req.method, route });
  });
  next();
}

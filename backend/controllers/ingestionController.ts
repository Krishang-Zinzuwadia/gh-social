import type { Request, Response } from 'express';

import type { RepositoryUpsert, TrendingSnapshotInput } from '../contracts/ingestion.v2.js';
import { PostgresRepositoryPersistence } from '../adapters/postgresRepositoryPersistence.js';
import { IngestionService } from '../services/ingestionService.js';
import { getV2FeatureFlags } from '../config/features.js';
import { TrendingService } from '../services/trendingService.js';
import { isValidUuid } from '../utils/validators.js';

const persistence = new PostgresRepositoryPersistence();
const ingestion = new IngestionService(persistence);
const trending = new TrendingService(persistence);

function validRepo(repo: unknown): repo is RepositoryUpsert {
  if (!repo || typeof repo !== 'object') return false;
  const item = repo as Record<string, unknown>;
  return typeof item.github_id === 'string' && /^\d+$/.test(item.github_id) && BigInt(item.github_id) > 0n
    && typeof item.full_name === 'string' && /^[^/]+\/[^/]+$/.test(item.full_name)
    && typeof item.owner === 'string' && typeof item.name === 'string' && typeof item.url === 'string'
    && typeof item.observed_at === 'string' && !Number.isNaN(Date.parse(item.observed_at));
}

export async function upsertRepositories(req: Request, res: Response): Promise<void> {
  if (!getV2FeatureFlags().DB_SCHEMA_V2_WRITES) {
    res.status(404).json({ error: 'Repository v2 writes are disabled.' }); return;
  }
  const repositories = req.body?.repositories;
  if (!Array.isArray(repositories) || repositories.length < 1 || repositories.length > 100 || !repositories.every(validRepo)) {
    res.status(400).json({ error: 'repositories must contain 1-100 valid canonical ingestion records.' }); return;
  }
  try { res.status(200).json({ mappings: await ingestion.bulkUpsert(repositories) }); }
  catch (error) { console.error('[IngestionController] Failed:', error); res.status(500).json({ error: 'Repository ingestion failed.' }); }
}

export async function ingestTrendingSnapshot(req: Request, res: Response): Promise<void> {
  if (!getV2FeatureFlags().DB_SCHEMA_V2_WRITES) {
    res.status(404).json({ error: 'Trending v2 writes are disabled.' }); return;
  }
  const input = req.body as TrendingSnapshotInput;
  if (!input || !isValidUuid(input.snapshot_id) || typeof input.period !== 'string'
    || typeof input.computed_at !== 'string' || Number.isNaN(Date.parse(input.computed_at))
    || !Array.isArray(input.repositories) || input.repositories.length < 1 || input.repositories.length > 100
    || !input.repositories.every((repo) => validRepo(repo) && Number.isInteger(repo.rank) && repo.rank >= 0)
    || new Set(input.repositories.map((repo) => repo.rank)).size !== input.repositories.length) {
    res.status(400).json({ error: 'Invalid complete trending snapshot.' }); return;
  }
  try { res.status(200).json(await trending.recordSnapshot(input)); }
  catch (error) { console.error('[TrendingController] Failed:', error); res.status(500).json({ error: 'Trending ingestion failed.' }); }
}

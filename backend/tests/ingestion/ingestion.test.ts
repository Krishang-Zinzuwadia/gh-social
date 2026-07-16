import assert from 'node:assert/strict';
import test from 'node:test';

import type { RepositoryUpsert, RepositoryUpsertResult, TrendingSnapshotInput } from '../../contracts/ingestion.v2.js';
import type { RepositoryPersistencePort } from '../../ports/repositoryPersistencePort.js';
import { IngestionService } from '../../services/ingestionService.js';

class FakeRepoPersistence implements RepositoryPersistencePort {
  async bulkUpsert(input: RepositoryUpsert[]): Promise<RepositoryUpsertResult[]> {
    return input.map((repo) => ({ github_id: repo.github_id, repo_id: '00000000-0000-4000-8000-000000000001', content_version: 1, changed: true }));
  }
  async recordTrendingSnapshot(input: TrendingSnapshotInput) {
    return { snapshot_id: input.snapshot_id, repository_count: input.repositories.length, activated_at: new Date(0).toISOString() };
  }
}

test('ingestion returns canonical mappings keyed by GitHub numeric ID', async () => {
  const service = new IngestionService(new FakeRepoPersistence());
  const results = await service.bulkUpsert([{ github_id: '123', full_name: 'old/name', owner: 'old', name: 'name',
    url: 'https://github.com/old/name', observed_at: new Date(0).toISOString() }]);
  assert.equal(results[0].github_id, '123');
  assert.match(results[0].repo_id, /^[0-9a-f-]{36}$/);
});

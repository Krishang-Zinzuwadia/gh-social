import type { TrendingSnapshotInput } from '../contracts/ingestion.v2.js';
import type { RepositoryPersistencePort } from '../ports/repositoryPersistencePort.js';

export class TrendingService {
  constructor(private readonly persistence: RepositoryPersistencePort) {}
  recordSnapshot(input: TrendingSnapshotInput) { return this.persistence.recordTrendingSnapshot(input); }
}

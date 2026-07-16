import type {
  RepositoryUpsert,
  RepositoryUpsertResult,
  TrendingSnapshotInput,
  TrendingSnapshotResult,
} from '../contracts/ingestion.v2.js';

export interface RepositoryPersistencePort {
  bulkUpsert(input: RepositoryUpsert[]): Promise<RepositoryUpsertResult[]>;
  recordTrendingSnapshot(input: TrendingSnapshotInput): Promise<TrendingSnapshotResult>;
}

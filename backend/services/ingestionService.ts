import type { RepositoryUpsert } from '../contracts/ingestion.v2.js';
import type { RepositoryPersistencePort } from '../ports/repositoryPersistencePort.js';

export class IngestionService {
  constructor(private readonly persistence: RepositoryPersistencePort) {}

  bulkUpsert(repositories: RepositoryUpsert[]) {
    return this.persistence.bulkUpsert(repositories);
  }
}

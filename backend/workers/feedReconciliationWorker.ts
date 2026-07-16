import type { FeedPersistencePort } from '../ports/feedPersistencePort.js';
import type { FeedQueuePort } from '../redis/feedQueue.js';

export class FeedReconciliationWorker {
  constructor(private readonly persistence: FeedPersistencePort, private readonly queue: FeedQueuePort) {}

  async runOnce(): Promise<{ committed: number; released: number }> {
    let committed = 0; let released = 0;
    for (const reservation of await this.queue.scanReservations()) {
      if (await this.persistence.getServeByRequest(reservation.userId, reservation.requestId)) {
        if (await this.queue.commit(reservation.userId, reservation.version, reservation.requestId, reservation.token)) committed++;
      } else if (await this.queue.release(reservation.userId, reservation.version, reservation.requestId, reservation.token)) released++;
      const current = await this.persistence.getFeedVersion(reservation.userId);
      await this.queue.deleteStaleVersions(reservation.userId, current);
    }
    return { committed, released };
  }
}

import { DataReconciliationService } from '../services/dataReconciliationService.js';

export class DataReconciliationWorker {
  constructor(private readonly service = new DataReconciliationService()) {}
  async runOnce(): Promise<void> { await this.service.reconcileCounters(); await this.service.resetAbandonedClaims(); }
}

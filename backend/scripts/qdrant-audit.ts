import fs from 'node:fs/promises';
import path from 'node:path';

const baseUrl = (process.env.QDRANT_URL ?? 'http://127.0.0.1:6333').replace(/\/+$/, '');
const collection = process.env.QDRANT_REPOSITORY_COLLECTION;
if (!collection) throw new Error('QDRANT_REPOSITORY_COLLECTION is required.');

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const headers: Record<string, string> = { 'content-type': 'application/json' };
if (process.env.QDRANT_API_KEY) headers['api-key'] = process.env.QDRANT_API_KEY;

interface Point { id: string | number; payload?: Record<string, unknown> }
let offset: string | number | null = null;
let total = 0;
let canonical = 0;
let missingPayload = 0;
let mismatchedIdentity = 0;
const repoCounts = new Map<string, number>();
const examples: Array<{ id: string; repo_id: unknown; reason: string }> = [];

do {
  const response = await fetch(`${baseUrl}/collections/${encodeURIComponent(collection)}/points/scroll`, {
    method: 'POST', headers,
    body: JSON.stringify({ limit: 256, offset, with_payload: true, with_vector: false }),
  });
  if (!response.ok) throw new Error(`Qdrant scroll failed with status ${response.status}.`);
  const body = await response.json() as { result?: { points?: Point[]; next_page_offset?: string | number | null } };
  const points = body.result?.points ?? [];
  for (const point of points) {
    total++;
    const id = String(point.id);
    const repoId = point.payload?.repo_id;
    if (typeof repoId !== 'string') {
      missingPayload++;
      if (examples.length < 20) examples.push({ id, repo_id: repoId, reason: 'missing_payload_repo_id' });
      continue;
    }
    repoCounts.set(repoId, (repoCounts.get(repoId) ?? 0) + 1);
    if (!uuid.test(id) || !uuid.test(repoId) || id !== repoId) {
      mismatchedIdentity++;
      if (examples.length < 20) examples.push({ id, repo_id: repoId, reason: 'point_id_must_equal_canonical_repo_uuid' });
      continue;
    }
    canonical++;
  }
  offset = body.result?.next_page_offset ?? null;
} while (offset != null);

const duplicates = [...repoCounts.entries()].filter(([, count]) => count > 1)
  .map(([repo_id, count]) => ({ repo_id, count }));
const report = {
  audited_at: new Date().toISOString(), collection, total, canonical, missing_payload: missingPayload,
  mismatched_identity: mismatchedIdentity, duplicate_repo_identities: duplicates.length,
  duplicate_examples: duplicates.slice(0, 20), invalid_examples: examples,
  cutover_ready: total > 0 && canonical === total && missingPayload === 0 && duplicates.length === 0,
};
const output = process.env.QDRANT_AUDIT_REPORT;
if (output) {
  await fs.mkdir(path.dirname(output), { recursive: true });
  await fs.writeFile(output, JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
if (!report.cutover_ready) process.exitCode = 1;

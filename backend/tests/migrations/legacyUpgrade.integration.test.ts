import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

import { LEGACY_BASELINE_TAGS, RETROACTIVE_LEGACY_TAGS } from '../../scripts/migrationPlan.js';

const integration = process.env.RUN_MIGRATION_UPGRADE_INTEGRATION === '1' ? test : test.skip;
const migrationsFolder = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../database/migrations');
const journal = JSON.parse(fs.readFileSync(path.join(migrationsFolder, 'meta/_journal.json'), 'utf8')) as {
  entries: Array<{ tag: string; when: number }>;
};

integration('parent-journal history executes retroactive migrations before 0008', async () => {
  const databaseUrl = process.env.DATABASE_URL;
  assert.ok(databaseUrl, 'DATABASE_URL is required for migration integration');
  const seed = postgres(databaseUrl, { max: 1, prepare: false });
  await seed`CREATE SCHEMA IF NOT EXISTS auth`;
  await seed`CREATE TABLE IF NOT EXISTS auth.users (id uuid PRIMARY KEY,raw_user_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb)`;
  await seed`CREATE SCHEMA drizzle`;
  await seed`CREATE TABLE drizzle.__drizzle_migrations (id serial PRIMARY KEY,hash text NOT NULL,created_at bigint)`;

  for (const tag of LEGACY_BASELINE_TAGS) {
    const entry = journal.entries.find((candidate) => candidate.tag === tag);
    assert.ok(entry, `Missing journal entry ${tag}`);
    const sql = fs.readFileSync(path.join(migrationsFolder, `${tag}.sql`), 'utf8');
    for (const statement of sql.split('--> statement-breakpoint')) {
      if (statement.trim()) await seed.unsafe(statement).simple();
    }
    const hash = crypto.createHash('sha256').update(sql).digest('hex');
    await seed`INSERT INTO drizzle.__drizzle_migrations(hash,created_at) VALUES(${hash},${entry.when})`;
  }

  // Reproduce the reported parent-history drift: the baseline hashes exist,
  // but the later retroactive is_saved migration has never run.
  await seed`ALTER TABLE public.activity DROP COLUMN is_saved`;
  const before = await seed`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public' AND table_name='activity' AND column_name='is_saved'
    ) AS present
  `;
  await seed.end({ timeout: 1 });
  assert.equal(before[0].present, false);

  Object.assign(process.env, { BOOTSTRAP_SUPABASE_AUTH_STUB: '1', NODE_ENV: 'test' });
  delete process.env.ADOPT_LEGACY_SCHEMA;
  await import(`../../scripts/migrate.js?legacy-upgrade-${Date.now()}`);

  const verify = postgres(databaseUrl, { max: 1, prepare: false });
  const columns = await verify`
    SELECT column_name FROM information_schema.columns
    WHERE table_schema='public' AND table_name='activity' AND column_name IN ('is_saved')
  `;
  assert.deepEqual(columns.map((row) => row.column_name), ['is_saved']);
  const interactionEvents = await verify`
    SELECT to_regclass('public.interaction_events') IS NOT NULL AS present
  `;
  assert.equal(interactionEvents[0].present, true);
  const hashes = new Set((await verify`SELECT hash FROM drizzle.__drizzle_migrations`).map((row) => String(row.hash)));
  for (const tag of RETROACTIVE_LEGACY_TAGS) {
    const sql = fs.readFileSync(path.join(migrationsFolder, `${tag}.sql`), 'utf8');
    assert.equal(hashes.has(crypto.createHash('sha256').update(sql).digest('hex')), true);
  }
  await verify.end({ timeout: 1 });
});

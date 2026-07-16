import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import { LEGACY_BASELINE_TAGS, RETROACTIVE_LEGACY_TAGS } from './migrationPlan.js';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(here, '../../database/migrations');
const journal = JSON.parse(
  fs.readFileSync(path.join(migrationsFolder, 'meta/_journal.json'), 'utf8'),
) as { entries: Array<{ idx: number; tag: string; when: number }> };

const client = postgres(databaseUrl, { max: 1, prepare: false });

type MigrationEntry = { idx: number; tag: string; when: number; hash: string; sql: string };

function migrationEntries(tags: readonly string[]): MigrationEntry[] {
  const allowed = new Set(tags);
  return journal.entries.filter((entry) => allowed.has(entry.tag)).map((entry) => {
    const sql = fs.readFileSync(path.join(migrationsFolder, `${entry.tag}.sql`), 'utf8');
    return { ...entry, sql, hash: crypto.createHash('sha256').update(sql).digest('hex') };
  });
}

async function recordedMigrationHashes(): Promise<Set<string>> {
  if (!await relationExists('drizzle', '__drizzle_migrations')) return new Set();
  const rows = await client`SELECT hash FROM drizzle.__drizzle_migrations`;
  return new Set(rows.map((row) => String(row.hash)));
}

async function ensureMigrationHistoryTable(): Promise<void> {
  await client`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await client`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id serial PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `;
}

async function bootstrapSupabaseAuthStub(): Promise<void> {
  if (process.env.BOOTSTRAP_SUPABASE_AUTH_STUB !== '1') return;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('BOOTSTRAP_SUPABASE_AUTH_STUB is forbidden in production.');
  }
  await client`CREATE SCHEMA IF NOT EXISTS auth`;
  await client`
    CREATE TABLE IF NOT EXISTS auth.users (
      id uuid PRIMARY KEY,
      raw_user_meta_data jsonb NOT NULL DEFAULT '{}'::jsonb
    )
  `;
  console.log('Created the explicit non-production Supabase auth.users migration stub.');
}

async function relationExists(schema: string, relation: string): Promise<boolean> {
  const rows = await client`
    SELECT EXISTS (
      SELECT 1 FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = ${schema} AND c.relname = ${relation}
    ) AS present
  `;
  return rows[0]?.present === true;
}

async function adoptLegacyHistory(): Promise<void> {
  const hasLegacySchema = await relationExists('public', 'repo');
  const hasDrizzleHistory = await relationExists('drizzle', '__drizzle_migrations');
  if (!hasLegacySchema) return;

  const legacyRelations = [
    'activity', 'board_repos', 'boards', 'boards_containers', 'comment', 'container_boards',
    'follows', 'oauth_codes', 'refresh_tokens', 'repo', 'users',
  ];
  const missingRelations: string[] = [];
  for (const relation of legacyRelations) {
    if (!await relationExists('public', relation)) missingRelations.push(relation);
  }

  const legacyEntries = migrationEntries(LEGACY_BASELINE_TAGS);
  const recordedHashes = hasDrizzleHistory ? await recordedMigrationHashes() : new Set<string>();
  const historyComplete = legacyEntries.every((entry) => recordedHashes.has(entry.hash));
  if (historyComplete) return;

  if (process.env.ADOPT_LEGACY_SCHEMA !== '1') {
    throw new Error(
      'A legacy public schema exists with incomplete Drizzle history. Audit a clone, then rerun once with ADOPT_LEGACY_SCHEMA=1.',
    );
  }
  if (missingRelations.length > 0) {
    throw new Error(`Cannot adopt incomplete legacy schema; missing public tables: ${missingRelations.join(', ')}.`);
  }

  await ensureMigrationHistoryTable();

  for (const entry of legacyEntries) {
    await client`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      SELECT ${entry.hash}, ${entry.when}
      WHERE NOT EXISTS (
        SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = ${entry.hash}
      )
    `;
  }
  console.log('Adopted the audited parent-journal legacy baseline into Drizzle history.');
}

async function applyRetroactiveLegacyMigrations(): Promise<void> {
  if (!await relationExists('public', 'repo')) return;
  await ensureMigrationHistoryTable();
  const recordedHashes = await recordedMigrationHashes();
  for (const entry of migrationEntries(RETROACTIVE_LEGACY_TAGS)) {
    if (recordedHashes.has(entry.hash)) continue;
    await client.begin(async (tx) => {
      for (const statement of entry.sql.split('--> statement-breakpoint')) {
        if (statement.trim()) await tx.unsafe(statement).simple();
      }
      await tx`
        INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
        VALUES (${entry.hash}, ${entry.when})
      `;
    });
    recordedHashes.add(entry.hash);
    console.log(`Applied retroactive legacy migration ${entry.tag}.`);
  }
}

try {
  await bootstrapSupabaseAuthStub();
  await adoptLegacyHistory();
  await applyRetroactiveLegacyMigrations();
  await migrate(drizzle(client), {
    migrationsFolder,
    migrationsSchema: 'drizzle',
    migrationsTable: '__drizzle_migrations',
  });
  console.log('Drizzle migrations are current.');
} finally {
  await client.end();
}

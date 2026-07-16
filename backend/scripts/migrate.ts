import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const here = path.dirname(fileURLToPath(import.meta.url));
const migrationsFolder = path.resolve(here, '../../database/migrations');
const journal = JSON.parse(
  fs.readFileSync(path.join(migrationsFolder, 'meta/_journal.json'), 'utf8'),
) as { entries: Array<{ idx: number; tag: string; when: number }> };

const client = postgres(databaseUrl, { max: 1, prepare: false });

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

  const legacyEntries = journal.entries.filter((item) => /^000[0-7]_/.test(item.tag)).map((entry) => ({
    ...entry,
    hash: crypto.createHash('sha256')
      .update(fs.readFileSync(path.join(migrationsFolder, `${entry.tag}.sql`)))
      .digest('hex'),
  }));
  let recordedHashes = new Set<string>();
  if (hasDrizzleHistory) {
    const rows = await client`SELECT hash FROM drizzle.__drizzle_migrations`;
    recordedHashes = new Set(rows.map((row) => String(row.hash)));
  }
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

  await client`CREATE SCHEMA IF NOT EXISTS drizzle`;
  await client`
    CREATE TABLE IF NOT EXISTS drizzle.__drizzle_migrations (
      id serial PRIMARY KEY,
      hash text NOT NULL,
      created_at bigint
    )
  `;

  for (const entry of legacyEntries) {
    await client`
      INSERT INTO drizzle.__drizzle_migrations (hash, created_at)
      SELECT ${entry.hash}, ${entry.when}
      WHERE NOT EXISTS (
        SELECT 1 FROM drizzle.__drizzle_migrations WHERE hash = ${entry.hash}
      )
    `;
  }
  console.log('Adopted audited legacy migrations 0000-0007 into Drizzle history.');
}

try {
  await bootstrapSupabaseAuthStub();
  await adoptLegacyHistory();
  await migrate(drizzle(client), {
    migrationsFolder,
    migrationsSchema: 'drizzle',
    migrationsTable: '__drizzle_migrations',
  });
  console.log('Drizzle migrations are current.');
} finally {
  await client.end();
}

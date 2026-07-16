import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import postgres from 'postgres';

interface Manifest {
  schemas: string[];
  tables: Record<string, string[]>;
  indexes: string[];
  functions: string[];
  roles: string[];
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error('DATABASE_URL is required.');

const here = path.dirname(fileURLToPath(import.meta.url));
const manifest = JSON.parse(
  fs.readFileSync(path.resolve(here, '../../database/audits/expected-v2-schema.json'), 'utf8'),
) as Manifest;
const client = postgres(databaseUrl, { max: 1, prepare: false });
const missing: string[] = [];

try {
  const schemaRows = await client`SELECT schema_name FROM information_schema.schemata`;
  const schemas = new Set(schemaRows.map((row) => String(row.schema_name)));
  for (const schema of manifest.schemas) if (!schemas.has(schema)) missing.push(`schema:${schema}`);

  const tableRows = await client`
    SELECT table_schema, table_name FROM information_schema.tables
    WHERE table_schema IN ('app', 'telemetry') AND table_type = 'BASE TABLE'
  `;
  const tables = new Set(tableRows.map((row) => `${row.table_schema}.${row.table_name}`));
  for (const [schema, names] of Object.entries(manifest.tables)) {
    for (const name of names) if (!tables.has(`${schema}.${name}`)) missing.push(`table:${schema}.${name}`);
  }

  const indexRows = await client`
    SELECT indexname FROM pg_indexes WHERE schemaname IN ('app', 'telemetry')
  `;
  const indexes = new Set(indexRows.map((row) => String(row.indexname)));
  for (const name of manifest.indexes) if (!indexes.has(name)) missing.push(`index:${name}`);

  const functionRows = await client`
    SELECT p.proname FROM pg_proc p JOIN pg_namespace n ON n.oid = p.pronamespace WHERE n.nspname = 'app'
  `;
  const functions = new Set(functionRows.map((row) => String(row.proname)));
  for (const name of manifest.functions) if (!functions.has(name)) missing.push(`function:app.${name}`);

  const roleRows = await client`SELECT rolname FROM pg_roles`;
  const roles = new Set(roleRows.map((row) => String(row.rolname)));
  for (const name of manifest.roles) if (!roles.has(name)) missing.push(`role:${name}`);

  const exposed = await client`
    SELECT grantee, table_schema, table_name, privilege_type
    FROM information_schema.role_table_grants
    WHERE table_schema IN ('app', 'telemetry') AND grantee IN ('anon', 'authenticated')
  `;
  for (const row of exposed) {
    missing.push(`prohibited-grant:${row.grantee}:${row.table_schema}.${row.table_name}:${row.privilege_type}`);
  }

  const migrationRows = await client`
    SELECT hash, created_at FROM drizzle.__drizzle_migrations ORDER BY created_at
  `.catch(() => []);
  if (migrationRows.length === 0) missing.push('migration-history:empty');

  if (missing.length > 0) {
    console.error('Schema audit failed:\n' + missing.map((item) => `- ${item}`).join('\n'));
    process.exitCode = 1;
  } else {
    console.log(`Schema audit passed: ${tables.size} v2 tables and ${migrationRows.length} migration hashes.`);
  }
} finally {
  await client.end();
}

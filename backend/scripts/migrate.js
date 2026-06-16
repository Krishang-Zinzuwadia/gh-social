import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  console.error('DATABASE_URL is required in .env');
  process.exit(1);
}

const sql = postgres(DATABASE_URL, { max: 1 });

async function runMigrations() {
  try {
    const migrationsDir = path.join(__dirname, '..', '..', 'database', 'migrations');
    
    // We expect exactly two files in order
    const files = ['0000_initial_schema.sql', '0001_custom_triggers.sql'];
    
    console.log('Connecting to database...');
    
    for (const file of files) {
      const filePath = path.join(migrationsDir, file);
      if (!fs.existsSync(filePath)) {
        console.warn(`File ${file} not found, skipping.`);
        continue;
      }
      
      console.log(`Executing ${file}...`);
      const query = fs.readFileSync(filePath, 'utf8');
      
      // Execute the raw SQL
      await sql.unsafe(query);
      console.log(`Successfully applied ${file}.`);
    }
    
    console.log('\nAll migrations completed successfully!');
    
  } catch (err) {
    console.error('\nMigration failed:', err.message || err);
    process.exitCode = 1;
  } finally {
    await sql.end();
  }
}

runMigrations();

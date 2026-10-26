import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { Client } from 'pg';

async function main() {
  const client = new Client({ connectionString: process.env.DATABASE_URL });
  await client.connect();
  await client.query(
    `CREATE TABLE IF NOT EXISTS schema_migrations (
       name TEXT PRIMARY KEY, applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW())`,
  );
  const dir = path.join(__dirname, '..', 'migrations');
  for (const file of fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    const done = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [file]);
    if (done.rowCount) {
      console.log(`skip    ${file}`);
      continue;
    }
    await client.query(fs.readFileSync(path.join(dir, file), 'utf8')); // each file wraps itself in BEGIN/COMMIT
    await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file]);
    console.log(`applied ${file}`);
  }
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './schema.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
  ssl: false,
});

const db = drizzle(pool, { schema });

async function main() {
  console.log('Seeding posts2 table...');

  await db.insert(schema.posts2).values([
    { title: 'Post 2-1 from Drizzle', body: 'This is the body of post 2-1' },
    { title: 'Post 2-2 from Drizzle', body: 'This is the body of post 2-2' },
    { title: 'Post 2-3 from Drizzle', body: 'This is the body of post 2-3' },
  ]);

  console.log('Seeding complete.');
  await pool.end();
}

main().catch((err) => {
  console.error('Error during seeding:', err);
  process.exit(1);
});

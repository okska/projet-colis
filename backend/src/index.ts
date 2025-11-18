import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { drizzle } from 'drizzle-orm/node-postgres'
import { posts2 } from './db/schema.js' // Import the Drizzle schema
import { auth } from './lib/auth.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const envPath = path.resolve(__dirname, '../../.env');
console.log('Loading .env from:', envPath);
dotenv.config({ path: envPath });

console.log('DB_USER:', process.env.DB_USER);
console.log('DB_HOST:', process.env.DB_HOST);
console.log('DB_NAME:', process.env.DB_NAME);
console.log('DB_PORT:', process.env.DB_PORT);

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || "5432"),
})

// Initialize Drizzle ORM
const db = drizzle(pool, { schema: { posts2 } });

const app = new Hono()

const corsConfig = {
  origin: 'http://localhost:3001',
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  exposeHeaders: ['Set-Cookie'],
}

const corsMiddleware = cors(corsConfig)

app.use('/api/*', corsMiddleware)

app.options('/api/auth/*', (c) => {
  return corsMiddleware(c, async () => {})
})

app.on(['POST', 'GET'], '/api/auth/*', (c) => {
  return auth.handler(c.req.raw)
})

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.get('/api/posts', async (c) => {
  try {
    const client = await pool.connect()
    const result = await client.query('SELECT * FROM posts')
    client.release()
    return c.json(result.rows)
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Failed to fetch posts from database' }, 500)
  }
})

app.get('/api/posts/:id', async (c) => {
  const idParam = c.req.param('id')
  const id = parseInt(idParam)

  if (isNaN(id)) {
    return c.json({ error: 'Invalid post ID' }, 400)
  }

  try {
    const client = await pool.connect()
    const result = await client.query('SELECT * FROM posts WHERE id = $1', [id])
    client.release()
    if (result.rows.length === 0) {
      return c.json({ error: 'Post not found' }, 404)
    }
    return c.json(result.rows[0])
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Failed to fetch post from database' }, 500)
  }
})

// New endpoint using Drizzle ORM
app.get('/api/posts2', async (c) => {
  try {
    const allPosts2 = await db.query.posts2.findMany();
    return c.json(allPosts2);
  } catch (err) {
    console.error(err);
    return c.json({ error: 'Failed to fetch posts2 from database using Drizzle' }, 500);
  }
});

serve({
  fetch: app.fetch,
  port: 3000
}, (info) => {
  console.log(`Server is running on http://localhost:${info.port}`)
})

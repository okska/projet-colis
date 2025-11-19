import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from './db/schema.js';
import { auth } from './lib/auth.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
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
});
// Initialize Drizzle ORM
const db = drizzle(pool, { schema });
const app = new Hono();
async function getSessionFromRequest(c) {
    try {
        const result = await auth.api.getSession({
            headers: c.req.raw.headers,
            request: c.req.raw,
        });
        if (!result?.session || !result.user) {
            return null;
        }
        return result;
    }
    catch (error) {
        const maybeStatus = error?.status;
        if (maybeStatus === 401) {
            return null;
        }
        console.error('[auth] Unable to retrieve session', error);
        return null;
    }
}
const corsConfig = {
    origin: 'http://localhost:3001',
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization'],
    allowMethods: ['GET', 'POST', 'OPTIONS'],
    exposeHeaders: ['Set-Cookie'],
};
const corsMiddleware = cors(corsConfig);
app.use('/api/*', corsMiddleware);
app.options('/api/auth/*', (c) => {
    return corsMiddleware(c, async () => { });
});
app.on(['POST', 'GET'], '/api/auth/*', (c) => {
    return auth.handler(c.req.raw);
});
app.get('/', (c) => {
    return c.text('Hello Hono!');
});
app.get('/api/posts', async (c) => {
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM posts');
        client.release();
        return c.json(result.rows);
    }
    catch (err) {
        console.error(err);
        return c.json({ error: 'Failed to fetch posts from database' }, 500);
    }
});
app.get('/api/posts/:id', async (c) => {
    const idParam = c.req.param('id');
    const id = parseInt(idParam);
    if (isNaN(id)) {
        return c.json({ error: 'Invalid post ID' }, 400);
    }
    try {
        const client = await pool.connect();
        const result = await client.query('SELECT * FROM posts WHERE id = $1', [id]);
        client.release();
        if (result.rows.length === 0) {
            return c.json({ error: 'Post not found' }, 404);
        }
        return c.json(result.rows[0]);
    }
    catch (err) {
        console.error(err);
        return c.json({ error: 'Failed to fetch post from database' }, 500);
    }
});
// New endpoint using Drizzle ORM
app.get('/api/posts2', async (c) => {
    try {
        const allPosts2 = await db.query.posts2.findMany();
        return c.json(allPosts2);
    }
    catch (err) {
        console.error(err);
        return c.json({ error: 'Failed to fetch posts2 from database using Drizzle' }, 500);
    }
});
app.get('/api/listings', async (c) => {
    const session = await getSessionFromRequest(c);
    if (!session) {
        return c.json({ error: 'Authentification requise.' }, 401);
    }
    try {
        const rows = await db
            .select()
            .from(schema.listings)
            .where(eq(schema.listings.expediteurId, session.user.id))
            .orderBy(desc(schema.listings.createdAt))
            .limit(50);
        return c.json(rows.map(formatListingResponse));
    }
    catch (err) {
        console.error('[listings] Failed to fetch listings', err);
        return c.json({ error: 'Unable to fetch listings' }, 500);
    }
});
app.get('/api/listings/public', async (c) => {
    try {
        const rows = await db
            .select()
            .from(schema.listings)
            .orderBy(desc(schema.listings.createdAt))
            .limit(50);
        return c.json(rows.map(formatListingResponse));
    }
    catch (err) {
        console.error('[listings] Failed to fetch public listings', err);
        return c.json({ error: 'Unable to fetch listings' }, 500);
    }
});
app.post('/api/listings', async (c) => {
    const session = await getSessionFromRequest(c);
    if (!session) {
        return c.json({ error: 'Authentification requise.' }, 401);
    }
    let body;
    try {
        body = await c.req.json();
    }
    catch (err) {
        return c.json({ error: 'Invalid JSON payload' }, 400);
    }
    const title = (body.title ?? '').trim();
    const pickupAddress = (body.pickup_address ?? body.pickupAddress ?? '').trim();
    const deliveryAddress = (body.delivery_address ?? body.deliveryAddress ?? '').trim();
    const budgetValue = Number(body.budget ?? 0);
    const currency = (body.currency ?? 'EUR').toString().toUpperCase();
    const pickupWindowInput = body.pickup_window ?? body.pickupWindow;
    if (!title || !pickupAddress || !deliveryAddress) {
        return c.json({ error: 'Les champs titre, adresse de retrait et adresse de livraison sont requis.' }, 400);
    }
    if (!Number.isFinite(budgetValue) || budgetValue <= 0) {
        return c.json({ error: 'Le budget doit être supérieur à 0.' }, 400);
    }
    const now = new Date();
    let pickupWindowRange;
    try {
        pickupWindowRange = toPgRangeString(pickupWindowInput);
    }
    catch (error) {
        const message = error instanceof RangeError
            ? error.message
            : 'Fenêtre de retrait invalide.';
        if (!(error instanceof RangeError)) {
            console.error('[listings] Invalid pickup window payload', error);
        }
        return c.json({ error: message }, 400);
    }
    try {
        const [created] = await db
            .insert(schema.listings)
            .values({
            expediteurId: session.user.id,
            title,
            shortDescription: typeof body.short_description === 'string'
                ? body.short_description
                : body.shortDescription,
            pickupAddress,
            deliveryAddress,
            status: 'published',
            parcelDetails: {
                weight_kg: 1,
                length_cm: 10,
                width_cm: 10,
                height_cm: 10,
                notes: body.short_description ?? body.shortDescription,
            },
            pickupWindow: pickupWindowRange,
            deliveryWindow: null,
            budget: budgetValue.toString(),
            currency,
            paymentStatus: 'unpaid',
            publishedAt: now,
            createdAt: now,
            updatedAt: now,
        })
            .returning();
        return c.json(formatListingResponse(created), 201);
    }
    catch (err) {
        console.error('[listings] Failed to create listing', err);
        return c.json({ error: 'Impossible de créer le listing.' }, 500);
    }
});
function formatListingResponse(row) {
    return {
        id: row.id,
        title: row.title,
        shortDescription: row.shortDescription ?? undefined,
        pickupAddress: row.pickupAddress ?? '',
        deliveryAddress: row.deliveryAddress ?? '',
        status: row.status,
        budget: row.budget ? Number(row.budget) : undefined,
        currency: row.currency ?? undefined,
        pickupWindow: parsePgRange(row.pickupWindow),
        createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
    };
}
function toPgRangeString(value) {
    if (!value?.start || !value?.end) {
        return null;
    }
    const startDate = new Date(value.start);
    const endDate = new Date(value.end);
    const startTime = startDate.getTime();
    const endTime = endDate.getTime();
    if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
        throw new RangeError('Dates de fenêtre de retrait invalides.');
    }
    if (startTime >= endTime) {
        throw new RangeError('La fin de la fenêtre de retrait doit être postérieure au début.');
    }
    const startIso = startDate.toISOString();
    const endIso = endDate.toISOString();
    return `[${startIso},${endIso})`;
}
function parsePgRange(value) {
    if (!value) {
        return undefined;
    }
    const trimmed = value.slice(1, -1); // remove [ and )
    const [startRaw, endRaw] = trimmed.split(',');
    if (!startRaw || !endRaw) {
        return undefined;
    }
    const start = startRaw.replace(/"/g, '').trim();
    const end = endRaw.replace(/"/g, '').trim();
    return { start, end };
}
const port = parseInt(process.env.PORT || '3000', 10);
serve({
    fetch: app.fetch,
    port,
}, (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
});

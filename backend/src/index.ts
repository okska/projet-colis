import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import type { Context } from 'hono'
import { cors } from 'hono/cors'
import { Pool } from 'pg'
import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { and, desc, eq, inArray, sql } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/node-postgres'
import * as schema from './db/schema.js'
import { auth } from './lib/auth.js'
import { isAdminUser } from './lib/admin.js'
import { isUserDriver, type DriverProfileStatus } from './lib/drivers.js'

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
const db = drizzle(pool, { schema });

const app = new Hono()
async function getSessionFromRequest(c: Context) {
  try {
    const result = await auth.api.getSession({
      headers: c.req.raw.headers,
      request: c.req.raw,
    })

    if (!result?.session || !result.user) {
      return null
    }

    return result
  } catch (error) {
    const maybeStatus = (error as any)?.status
    if (maybeStatus === 401) {
      return null
    }

    console.error('[auth] Unable to retrieve session', error)
    return null
  }
}

const corsConfig = {
  origin: 'http://localhost:3001',
  credentials: true,
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
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
    const allPosts2 = await db.query.posts2.findMany()
    return c.json(allPosts2)
  } catch (err) {
    console.error(err)
    return c.json({ error: 'Failed to fetch posts2 from database using Drizzle' }, 500)
  }
})

app.get('/api/listings', async (c) => {
  const session = await getSessionFromRequest(c)
  if (!session) {
    return c.json({ error: 'Authentification requise.' }, 401)
  }

  try {
    const rows = await db
      .select()
      .from(schema.listings)
      .where(eq(schema.listings.expediteurId, session.user.id))
      .orderBy(desc(schema.listings.createdAt))
      .limit(50)

    let requestCounts: Record<string, number> = {}
    const listingIds = rows.map((row) => row.id)
    if (listingIds.length > 0) {
      const counts = await db
        .select({
          listingId: schema.listingDeliveryRequests.listingId,
          count: sql<number>`count(*)`,
        })
        .from(schema.listingDeliveryRequests)
        .where(inArray(schema.listingDeliveryRequests.listingId, listingIds))
        .groupBy(schema.listingDeliveryRequests.listingId)

      requestCounts = counts.reduce<Record<string, number>>((acc, curr) => {
        acc[curr.listingId] = Number(curr.count)
        return acc
      }, {})
    }

    return c.json(
      rows.map((row) => ({
        ...formatListingResponse(row),
        deliveryRequestCount: requestCounts[row.id] ?? 0,
      })),
    )
  } catch (err) {
    console.error('[listings] Failed to fetch listings', err)
    return c.json({ error: 'Unable to fetch listings' }, 500)
  }
})

app.get('/api/listings/public', async (c) => {
  const session = await getSessionFromRequest(c)
  try {
    const rows = await db
      .select()
      .from(schema.listings)
      .orderBy(desc(schema.listings.createdAt))
      .limit(50)

    const formatted = rows.map(formatListingResponse)

    if (!session) {
      return c.json(formatted)
    }

    const isDriver = await isUserDriver(db, session.user.id)
    if (!isDriver) {
      return c.json(formatted)
    }

    const requests = await fetchDriverRequestIds(session.user.id)
    const requestedSet = new Set(requests)
    return c.json(
      formatted.map((listing) => ({
        ...listing,
        viewerHasRequested: requestedSet.has(listing.id),
      })),
    )
  } catch (err) {
    console.error('[listings] Failed to fetch public listings', err)
    return c.json({ error: 'Unable to fetch listings' }, 500)
  }
})

app.get('/api/me/driver-status', async (c) => {
  const session = await getSessionFromRequest(c)
  if (!session) {
    return c.json({ error: 'Authentification requise.' }, 401)
  }

  try {
    const isDriver = await isUserDriver(db, session.user.id)
    return c.json({ isDriver })
  } catch (error) {
    console.error('[drivers] Unable to determine driver status', error)
    return c.json({ error: 'Unable to determine driver status' }, 500)
  }
})

app.post('/api/listings', async (c) => {
  const session = await getSessionFromRequest(c)
  if (!session) {
    return c.json({ error: 'Authentification requise.' }, 401)
  }

  let body: any
  try {
    body = await c.req.json()
  } catch (err) {
    return c.json({ error: 'Invalid JSON payload' }, 400)
  }

  const title = (body.title ?? '').trim()
  const pickupAddress = (body.pickup_address ?? body.pickupAddress ?? '').trim()
  const deliveryAddress = (body.delivery_address ?? body.deliveryAddress ?? '').trim()
  const budgetValue = Number(body.budget ?? 0)
  const currency = (body.currency ?? 'EUR').toString().toUpperCase()
  const pickupWindowInput = body.pickup_window ?? body.pickupWindow

  if (!title || !pickupAddress || !deliveryAddress) {
    return c.json(
      { error: 'Les champs titre, adresse de retrait et adresse de livraison sont requis.' },
      400,
    )
  }

  if (!Number.isFinite(budgetValue) || budgetValue <= 0) {
    return c.json({ error: 'Le budget doit être supérieur à 0.' }, 400)
  }

  const now = new Date()
  let pickupWindowRange: string | null
  try {
    pickupWindowRange = toPgRangeString(pickupWindowInput)
  } catch (error) {
    const message =
      error instanceof RangeError
        ? error.message
        : 'Fenêtre de retrait invalide.'
    if (!(error instanceof RangeError)) {
      console.error('[listings] Invalid pickup window payload', error)
    }
    return c.json({ error: message }, 400)
  }

  try {
    const [created] = await db
      .insert(schema.listings)
      .values({
        expediteurId: session.user.id,
        title,
        shortDescription:
          typeof body.short_description === 'string'
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
      .returning()

    return c.json(formatListingResponse(created), 201)
  } catch (err) {
    console.error('[listings] Failed to create listing', err)
    return c.json({ error: 'Impossible de créer le listing.' }, 500)
  }
})

app.post('/api/listings/:listingId/request-delivery', async (c) => {
  const session = await getSessionFromRequest(c)
  if (!session) {
    return c.json({ error: 'Authentification requise.' }, 401)
  }

  const listingId = c.req.param('listingId')
  if (!listingId) {
    return c.json({ error: 'Listing ID requis.' }, 400)
  }

  const isDriver = await isUserDriver(db, session.user.id)
  if (!isDriver) {
    return c.json(
      { error: 'Seuls les livreurs peuvent effectuer cette action.' },
      403,
    )
  }

  try {
    const [listing] = await db
      .select({
        id: schema.listings.id,
        ownerId: schema.listings.expediteurId,
        acceptedRequestId: schema.listings.acceptedRequestId,
        status: schema.listings.status,
      })
      .from(schema.listings)
      .where(eq(schema.listings.id, listingId))
      .limit(1)

    if (!listing) {
      return c.json({ error: 'Listing introuvable.' }, 404)
    }

    if (listing.ownerId === session.user.id) {
      return c.json(
        { error: 'Vous ne pouvez pas livrer votre propre annonce.' },
        400,
      )
    }

    if (
      listing.acceptedRequestId ||
      ['assigned', 'ready_for_pickup', 'in_transit', 'delivered'].includes(
        listing.status,
      )
    ) {
      return c.json(
        { error: 'Ce listing a déjà un livreur attribué.' },
        400,
      )
    }

    const [existingRequest] = await db
      .select({ id: schema.listingDeliveryRequests.id })
      .from(schema.listingDeliveryRequests)
      .where(
        and(
          eq(schema.listingDeliveryRequests.listingId, listingId),
          eq(schema.listingDeliveryRequests.driverId, session.user.id),
        ),
      )
      .limit(1)

    if (existingRequest) {
      return c.json(
        { error: 'Vous avez déjà demandé à livrer ce colis.' },
        409,
      )
    }

    await db.insert(schema.listingDeliveryRequests).values({
      listingId,
      driverId: session.user.id,
      status: 'pending',
    })

    return c.json({ message: 'Votre demande a bien été envoyée.' }, 201)
  } catch (error) {
    console.error('[delivery-request] Unable to create request', error)
    return c.json({ error: 'Impossible d’enregistrer la demande.' }, 500)
  }
})

app.get('/api/listings/:listingId/delivery-requests', async (c) => {
  const session = await getSessionFromRequest(c)

  if (!session) {
    return c.json({ error: 'Authentification requise.' }, 401)
  }

  const listingId = c.req.param('listingId')
  if (!listingId) {
    return c.json({ error: 'Listing ID requis.' }, 400)
  }

  try {
    const [listing] = await db
      .select({
        id: schema.listings.id,
        ownerId: schema.listings.expediteurId,
      })
      .from(schema.listings)
      .where(eq(schema.listings.id, listingId))
      .limit(1)

    if (!listing) {
      return c.json({ error: 'Listing introuvable.' }, 404)
    }

    if (listing.ownerId !== session.user.id) {
      return c.json({ error: 'Accès réservé au propriétaire du listing.' }, 403)
    }

    const requests = await db
      .select({
        id: schema.listingDeliveryRequests.id,
        driverId: schema.listingDeliveryRequests.driverId,
        status: schema.listingDeliveryRequests.status,
        createdAt: schema.listingDeliveryRequests.createdAt,
        driverName: schema.users.name,
        driverEmail: schema.users.email,
      })
      .from(schema.listingDeliveryRequests)
      .innerJoin(
        schema.users,
        eq(schema.users.id, schema.listingDeliveryRequests.driverId),
      )
      .where(eq(schema.listingDeliveryRequests.listingId, listingId))
      .orderBy(desc(schema.listingDeliveryRequests.createdAt))

    return c.json(requests)
  } catch (error) {
    console.error('[delivery-request] Unable to list requests', error)
    return c.json({ error: 'Impossible de récupérer les demandes.' }, 500)
  }
})

app.delete('/api/listings/:listingId/request-delivery', async (c) => {
  const session = await getSessionFromRequest(c)
  if (!session) {
    return c.json({ error: 'Authentification requise.' }, 401)
  }

  const listingId = c.req.param('listingId')
  if (!listingId) {
    return c.json({ error: 'Listing ID requis.' }, 400)
  }

  const isDriver = await isUserDriver(db, session.user.id)
  if (!isDriver) {
    return c.json(
      { error: 'Seuls les livreurs peuvent effectuer cette action.' },
      403,
    )
  }

  try {
    const result = await db
      .delete(schema.listingDeliveryRequests)
      .where(
        and(
          eq(schema.listingDeliveryRequests.listingId, listingId),
          eq(schema.listingDeliveryRequests.driverId, session.user.id),
        ),
      )
      .returning({ id: schema.listingDeliveryRequests.id })

    if (result.length === 0) {
      return c.json({ error: 'Aucune demande à annuler.' }, 404)
    }

    return c.json({ message: 'Votre demande a été annulée.' })
  } catch (error) {
    console.error('[delivery-request] Unable to cancel request', error)
    return c.json({ error: 'Impossible d’annuler la demande.' }, 500)
  }
})

app.post(
  '/api/listings/:listingId/delivery-requests/:requestId/accept',
  async (c) => {
    const session = await getSessionFromRequest(c)

    if (!session) {
      return c.json({ error: 'Authentification requise.' }, 401)
    }

    const listingId = c.req.param('listingId')
    const requestId = c.req.param('requestId')

    if (!listingId || !requestId) {
      return c.json({ error: 'Identifiants manquants.' }, 400)
    }

    try {
    const [request] = await db
      .select({
        requestId: schema.listingDeliveryRequests.id,
        driverId: schema.listingDeliveryRequests.driverId,
        status: schema.listingDeliveryRequests.status,
        listingOwner: schema.listings.expediteurId,
        listingAcceptedRequestId: schema.listings.acceptedRequestId,
      })
      .from(schema.listingDeliveryRequests)
      .innerJoin(
        schema.listings,
        eq(schema.listings.id, schema.listingDeliveryRequests.listingId),
      )
        .where(
          and(
            eq(schema.listingDeliveryRequests.id, requestId),
            eq(schema.listingDeliveryRequests.listingId, listingId),
          ),
        )
        .limit(1)

      if (!request) {
        return c.json({ error: 'Demande introuvable.' }, 404)
      }

      if (request.listingOwner !== session.user.id) {
        return c.json({ error: 'Accès réservé au propriétaire du listing.' }, 403)
      }

    if (request.status !== 'pending') {
      return c.json({ error: 'Cette demande a déjà été traitée.' }, 400)
    }

    if (
      request.listingAcceptedRequestId &&
      request.listingAcceptedRequestId !== requestId
    ) {
      return c.json({ error: 'Un livreur a déjà été accepté pour ce listing.' }, 400)
    }

      const now = new Date()

      await db
        .update(schema.listingDeliveryRequests)
        .set({ status: 'accepted', updatedAt: now })
        .where(eq(schema.listingDeliveryRequests.id, requestId))

      await db
        .update(schema.listings)
        .set({
          status: 'assigned',
          acceptedRequestId: requestId,
          currentDriverId: request.driverId,
          assignedAt: now,
          updatedAt: now,
        })
        .where(eq(schema.listings.id, listingId))

      await db
        .update(schema.listingDeliveryRequests)
        .set({ status: 'declined', updatedAt: now })
        .where(
          and(
            eq(schema.listingDeliveryRequests.listingId, listingId),
            eq(schema.listingDeliveryRequests.status, 'pending'),
            sql`${schema.listingDeliveryRequests.id} != ${requestId}`,
          ),
        )

      return c.json({ message: 'Demande acceptée.' })
    } catch (error) {
      console.error('[delivery-request] Unable to accept request', error)
      return c.json({ error: 'Impossible d’accepter cette demande.' }, 500)
    }
  },
)

app.get('/api/listings/:listingId/delivery-requests', async (c) => {
  const session = await getSessionFromRequest(c)

  if (!session) {
    return c.json({ error: 'Authentification requise.' }, 401)
  }

  const listingId = c.req.param('listingId')
  if (!listingId) {
    return c.json({ error: 'Listing ID requis.' }, 400)
  }

  try {
    const [listing] = await db
      .select({
        id: schema.listings.id,
        ownerId: schema.listings.expediteurId,
      })
      .from(schema.listings)
      .where(eq(schema.listings.id, listingId))
      .limit(1)

    if (!listing) {
      return c.json({ error: 'Listing introuvable.' }, 404)
    }

    if (listing.ownerId !== session.user.id) {
      return c.json({ error: 'Accès réservé au propriétaire du listing.' }, 403)
    }

    const requests = await db
      .select({
        id: schema.listingDeliveryRequests.id,
        driverId: schema.listingDeliveryRequests.driverId,
        status: schema.listingDeliveryRequests.status,
        createdAt: schema.listingDeliveryRequests.createdAt,
        driverName: schema.users.name,
        driverEmail: schema.users.email,
      })
      .from(schema.listingDeliveryRequests)
      .innerJoin(
        schema.users,
        eq(schema.users.id, schema.listingDeliveryRequests.driverId),
      )
      .where(eq(schema.listingDeliveryRequests.listingId, listingId))
      .orderBy(desc(schema.listingDeliveryRequests.createdAt))

    return c.json(requests)
  } catch (error) {
    console.error('[delivery-request] Unable to list requests', error)
    return c.json({ error: 'Impossible de récupérer les demandes.' }, 500)
  }
})

app.get('/api/driver/delivery-requests', async (c) => {
  const session = await getSessionFromRequest(c)
  if (!session) {
    return c.json({ error: 'Authentification requise.' }, 401)
  }

  const isDriver = await isUserDriver(db, session.user.id)
  if (!isDriver) {
    return c.json({ error: 'Profil livreur requis.' }, 403)
  }

  try {
    const requests = await db
      .select({
        id: schema.listingDeliveryRequests.id,
        listingId: schema.listingDeliveryRequests.listingId,
        status: schema.listingDeliveryRequests.status,
        createdAt: schema.listingDeliveryRequests.createdAt,
        listingTitle: schema.listings.title,
        pickupAddress: schema.listings.pickupAddress,
        deliveryAddress: schema.listings.deliveryAddress,
      })
      .from(schema.listingDeliveryRequests)
      .innerJoin(
        schema.listings,
        eq(schema.listings.id, schema.listingDeliveryRequests.listingId),
      )
      .where(eq(schema.listingDeliveryRequests.driverId, session.user.id))
      .orderBy(desc(schema.listingDeliveryRequests.createdAt))

    return c.json(requests)
  } catch (error) {
    console.error('[driver] Unable to fetch assignments', error)
    return c.json({ error: 'Impossible de récupérer vos livraisons.' }, 500)
  }
})

app.get('/api/listings/delivery-requests', async (c) => {
  const session = await getSessionFromRequest(c)
  if (!session) {
    return c.json({ error: 'Authentification requise.' }, 401)
  }

  const isDriver = await isUserDriver(db, session.user.id)
  if (!isDriver) {
    return c.json({ error: 'Profil livreur requis.' }, 403)
  }

  try {
    const listingIds = await fetchDriverRequestIds(session.user.id)
    return c.json({ listingIds })
  } catch (error) {
    console.error('[delivery-request] Unable to list requests', error)
    return c.json({ error: 'Impossible de récupérer les demandes.' }, 500)
  }
})

app.get('/api/admin/users', async (c) => {
  const session = await getSessionFromRequest(c)

  if (!session || !isAdminUser(session.user)) {
    return c.json({ error: 'Accès administrateur requis.' }, 403)
  }

  try {
    const rows = await db
      .select({
        id: schema.users.id,
        name: schema.users.name,
        email: schema.users.email,
        driverStatus: schema.driverProfiles.profileStatus,
        createdAt: schema.users.createdAt,
      })
      .from(schema.users)
      .leftJoin(
        schema.driverProfiles,
        eq(schema.driverProfiles.userId, schema.users.id),
      )
      .orderBy(desc(schema.users.createdAt))

    return c.json(rows.map(formatAdminUserResponse))
  } catch (error) {
    console.error('[admin] Failed to list users', error)
    return c.json({ error: 'Unable to fetch users' }, 500)
  }
})

app.post('/api/admin/users/:userId/driver', async (c) => {
  const session = await getSessionFromRequest(c)

  if (!session || !isAdminUser(session.user)) {
    return c.json({ error: 'Accès administrateur requis.' }, 403)
  }

  const userId = c.req.param('userId')
  if (!userId) {
    return c.json({ error: 'User ID is required.' }, 400)
  }

  const [userExists] = await db
    .select({ id: schema.users.id })
    .from(schema.users)
    .where(eq(schema.users.id, userId))
    .limit(1)

  if (!userExists) {
    return c.json({ error: 'Utilisateur introuvable.' }, 404)
  }

  const now = new Date()

  try {
    await db
      .insert(schema.driverProfiles)
      .values({
        userId,
        profileStatus: 'active',
        activatedAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: schema.driverProfiles.userId,
        set: {
          profileStatus: 'active',
          activatedAt: now,
          suspendedAt: null,
          updatedAt: now,
        },
      })

    const updatedUser = await fetchAdminUser(userId)
    if (!updatedUser) {
      return c.json({ error: 'Unable to fetch updated user' }, 500)
    }

    return c.json(updatedUser)
  } catch (error) {
    console.error('[admin] Unable to promote user to driver', error)
    return c.json({ error: 'Unable to promote user' }, 500)
  }
})

type ListingRow = typeof schema.listings.$inferSelect

function formatListingResponse(row: ListingRow) {
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
    ownerId: row.expediteurId,
    createdAt: row.createdAt?.toISOString() ?? new Date().toISOString(),
  }
}

async function fetchDriverRequestIds(userId: string) {
  const rows = await db
    .select({ listingId: schema.listingDeliveryRequests.listingId })
    .from(schema.listingDeliveryRequests)
    .where(eq(schema.listingDeliveryRequests.driverId, userId))

  return rows.map((row) => row.listingId)
}

function toPgRangeString(value?: { start?: string; end?: string } | null) {
  if (!value?.start || !value?.end) {
    return null
  }

  const startDate = new Date(value.start)
  const endDate = new Date(value.end)
  const startTime = startDate.getTime()
  const endTime = endDate.getTime()

  if (Number.isNaN(startTime) || Number.isNaN(endTime)) {
    throw new RangeError('Dates de fenêtre de retrait invalides.')
  }

  if (startTime >= endTime) {
    throw new RangeError(
      'La fin de la fenêtre de retrait doit être postérieure au début.',
    )
  }

  const startIso = startDate.toISOString()
  const endIso = endDate.toISOString()

  return `[${startIso},${endIso})`
}

function parsePgRange(value?: string | null) {
  if (!value) {
    return undefined
  }

  const trimmed = value.slice(1, -1) // remove [ and )
  const [startRaw, endRaw] = trimmed.split(',')
  if (!startRaw || !endRaw) {
    return undefined
  }

  const start = startRaw.replace(/"/g, '').trim()
  const end = endRaw.replace(/"/g, '').trim()

  return { start, end }
}

type AdminUserRow = {
  id: string
  name: string | null
  email: string
  driverStatus: DriverProfileStatus | null
}

function formatAdminUserResponse(row: AdminUserRow) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    driverStatus: row.driverStatus ?? null,
    isDriver: row.driverStatus === 'active',
  }
}

async function fetchAdminUser(userId: string) {
  const [user] = await db
    .select({
      id: schema.users.id,
      name: schema.users.name,
      email: schema.users.email,
      driverStatus: schema.driverProfiles.profileStatus,
    })
    .from(schema.users)
    .leftJoin(
      schema.driverProfiles,
      eq(schema.driverProfiles.userId, schema.users.id),
    )
    .where(eq(schema.users.id, userId))
    .limit(1)

  if (!user) {
    return null
  }

  return formatAdminUserResponse(user)
}

const port = parseInt(process.env.PORT || '3000', 10)

serve(
  {
    fetch: app.fetch,
    port,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`)
  },
)

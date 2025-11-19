import { sql } from 'drizzle-orm';
import { bigserial, char, check, customType, index, integer, jsonb, numeric, pgTable, pgSchema, primaryKey, serial, smallint, text, timestamp, uniqueIndex, uuid, varchar, boolean, } from 'drizzle-orm/pg-core';
export const posts2 = pgTable('posts2', {
    id: serial('id').primaryKey(),
    title: varchar('title', { length: 255 }).notNull(),
    body: text('body').notNull(),
});
export const users = pgTable('user', {
    id: text('id').primaryKey(),
    name: text('name'),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
export const sessions = pgTable('session', {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
});
export const accounts = pgTable('account', {
    id: text('id').primaryKey(),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
export const verifications = pgTable('verification', {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
const app = pgSchema('app');
export const listingStatusEnum = app.enum('listing_status', [
    'draft',
    'published',
    'assigned',
    'ready_for_pickup',
    'in_transit',
    'delivered',
    'cancelled',
    'disputed',
    'archived',
]);
export const deliveryRequestStatusEnum = app.enum('delivery_request_status', [
    'pending',
    'accepted',
    'declined',
    'withdrawn',
    'expired',
    'cancelled_by_sender',
]);
export const driverProfileStatusEnum = app.enum('driver_profile_status', [
    'pending_verification',
    'active',
    'suspended',
    'blocked',
]);
export const paymentStatusEnum = app.enum('payment_status', ['unpaid', 'reserved', 'released']);
export const reviewRoleEnum = app.enum('review_role', ['expediteur', 'driver']);
const tstzRange = customType({
    dataType() {
        return 'tstzrange';
    },
});
export const userProfiles = app.table('user_profiles', {
    userId: text('user_id')
        .primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),
    displayName: text('display_name'),
    phoneNumber: text('phone_number'),
    defaultPickupAddress: text('default_pickup_address'),
    defaultDeliveryAddress: text('default_delivery_address'),
    avatarUrl: text('avatar_url'),
    preferredLanguage: varchar('preferred_language', { length: 10 }),
    bioSender: text('bio_sender'),
    bioDriver: text('bio_driver'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
export const driverProfiles = app.table('driver_profiles', {
    userId: text('user_id')
        .primaryKey()
        .references(() => users.id, { onDelete: 'cascade' }),
    profileStatus: driverProfileStatusEnum('profile_status').default('pending_verification').notNull(),
    vehicleType: text('vehicle_type'),
    maxWeightKg: numeric('max_weight_kg', { precision: 10, scale: 2 }),
    maxLengthCm: numeric('max_length_cm', { precision: 10, scale: 2 }),
    yearsOfExperience: integer('years_of_experience'),
    documents: jsonb('documents').$type().default({}).notNull(),
    ratingAverage: numeric('rating_average', { precision: 3, scale: 2 }),
    ratingCount: integer('rating_count').default(0).notNull(),
    lastConnectionAt: timestamp('last_connection_at', { withTimezone: true }),
    activatedAt: timestamp('activated_at', { withTimezone: true }),
    suspendedAt: timestamp('suspended_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
});
export const listings = app.table('listings', {
    id: uuid('id').defaultRandom().primaryKey(),
    expediteurId: text('expediteur_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    title: varchar('title', { length: 255 }).notNull(),
    shortDescription: text('short_description'),
    longDescription: text('long_description'),
    status: listingStatusEnum('status').default('draft').notNull(),
    parcelDetails: jsonb('parcel_details')
        .$type()
        .default({
        weight_kg: 0,
        length_cm: 0,
        width_cm: 0,
        height_cm: 0,
    })
        .notNull(),
    pickupAddress: text('pickup_address'),
    pickupLat: numeric('pickup_lat', { precision: 9, scale: 6 }),
    pickupLng: numeric('pickup_lng', { precision: 9, scale: 6 }),
    pickupWindow: tstzRange('pickup_window'),
    deliveryAddress: text('delivery_address'),
    deliveryLat: numeric('delivery_lat', { precision: 9, scale: 6 }),
    deliveryLng: numeric('delivery_lng', { precision: 9, scale: 6 }),
    deliveryWindow: tstzRange('delivery_window'),
    budget: numeric('budget', { precision: 10, scale: 2 }),
    currency: char('currency', { length: 3 }).default('EUR').notNull(),
    paymentStatus: paymentStatusEnum('payment_status').default('unpaid').notNull(),
    acceptedRequestId: uuid('accepted_request_id'),
    currentDriverId: text('current_driver_id').references(() => users.id, { onDelete: 'set null' }),
    publishedAt: timestamp('published_at', { withTimezone: true }),
    assignedAt: timestamp('assigned_at', { withTimezone: true }),
    pickedUpAt: timestamp('picked_up_at', { withTimezone: true }),
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
    archivedAt: timestamp('archived_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => ({
    parcelDetailsHasRequiredFields: check('listings_parcel_details_keys', sql `${table.parcelDetails} ?& array['weight_kg','length_cm','width_cm','height_cm']`),
    statusPickupWindowIdx: index('listings_status_pickup_window_idx').on(table.status, table.pickupWindow),
    expediteurCreatedIdx: index('listings_expediteur_created_idx').on(table.expediteurId, table.createdAt),
    currentDriverStatusIdx: index('listings_driver_status_idx').on(table.currentDriverId, table.status),
}));
export const listingMedia = app.table('listing_media', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    listingId: uuid('listing_id')
        .notNull()
        .references(() => listings.id, { onDelete: 'cascade' }),
    storagePath: text('storage_path').notNull(),
    mediaType: text('media_type'),
    sortOrder: integer('sort_order').default(0).notNull(),
    metadata: jsonb('metadata').$type().default({}).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
export const listingDeliveryRequests = app.table('listing_delivery_requests', {
    id: uuid('id').defaultRandom().primaryKey(),
    listingId: uuid('listing_id')
        .notNull()
        .references(() => listings.id, { onDelete: 'cascade' }),
    driverId: text('driver_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    status: deliveryRequestStatusEnum('status').default('pending').notNull(),
    message: text('message'),
    proposedPrice: numeric('proposed_price', { precision: 10, scale: 2 }),
    estimatedPickupTime: timestamp('estimated_pickup_time', { withTimezone: true }),
    vehicleNotes: text('vehicle_notes'),
    decisionBySenderAt: timestamp('decision_by_sender_at', { withTimezone: true }),
    decisionReason: text('decision_reason'),
    withdrawnAt: timestamp('withdrawn_at', { withTimezone: true }),
    expiredAt: timestamp('expired_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
        .defaultNow()
        .$onUpdate(() => new Date())
        .notNull(),
}, (table) => ({
    listingDriverUnique: uniqueIndex('listing_delivery_requests_listing_driver_key').on(table.listingId, table.driverId),
    driverStatusIdx: index('listing_delivery_requests_driver_status_idx').on(table.driverId, table.status),
    listingStatusIdx: index('listing_delivery_requests_listing_status_idx').on(table.listingId, table.status),
}));
export const listingStatusHistory = app.table('listing_status_history', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    listingId: uuid('listing_id')
        .notNull()
        .references(() => listings.id, { onDelete: 'cascade' }),
    previousStatus: listingStatusEnum('previous_status'),
    newStatus: listingStatusEnum('new_status').notNull(),
    changedBy: text('changed_by').references(() => users.id, { onDelete: 'set null' }),
    changedAt: timestamp('changed_at', { withTimezone: true }).defaultNow().notNull(),
    notes: text('notes'),
});
export const deliveryReviews = app.table('delivery_reviews', {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    listingId: uuid('listing_id').references(() => listings.id, { onDelete: 'set null' }),
    reviewerId: text('reviewer_id').references(() => users.id, { onDelete: 'set null' }),
    reviewedId: text('reviewed_id').references(() => users.id, { onDelete: 'set null' }),
    role: reviewRoleEnum('role').notNull(),
    rating: smallint('rating').notNull(),
    comment: text('comment'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    ratingRangeCheck: check('delivery_reviews_rating_range', sql `${table.rating} BETWEEN 1 AND 5`),
}));
export const listingWatchers = app.table('listing_watchers', {
    listingId: uuid('listing_id')
        .notNull()
        .references(() => listings.id, { onDelete: 'cascade' }),
    userId: text('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
    pk: primaryKey({ name: 'listing_watchers_pkey', columns: [table.listingId, table.userId] }),
}));

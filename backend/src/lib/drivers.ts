import { eq } from 'drizzle-orm'
import type { NodePgDatabase } from 'drizzle-orm/node-postgres'
import * as schema from '../db/schema.js'

export type DriverProfileStatus =
  typeof schema.driverProfiles.$inferSelect['profileStatus']

const ACTIVE_DRIVER_STATUSES: DriverProfileStatus[] = ['active']

/**
 * Returns true if the provided user has an active driver profile.
 *
 * The check ensures the user exists in the `users` table, then looks for a matching
 * record in `app.driver_profiles`. Only users whose driver profile is marked as
 * `active` are considered "livreurs".
 */
export async function isUserDriver(
  db: NodePgDatabase<typeof schema>,
  userId: string | null | undefined,
): Promise<boolean> {
  if (!userId) {
    return false
  }

  const [result] = await db
    .select({
      userId: schema.users.id,
      driverStatus: schema.driverProfiles.profileStatus,
    })
    .from(schema.users)
    .leftJoin(
      schema.driverProfiles,
      eq(schema.driverProfiles.userId, schema.users.id),
    )
    .where(eq(schema.users.id, userId))
    .limit(1)

  if (!result?.driverStatus) {
    return false
  }

  return ACTIVE_DRIVER_STATUSES.includes(result.driverStatus)
}

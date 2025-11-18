import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { accounts, sessions, users, verifications } from "../db/schema.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`,
});

const db = drizzle(pool, {
  schema: {
    accounts,
    sessions,
    users,
    verifications,
  },
});

const baseURL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
const trustedOrigins = (process.env.BETTER_AUTH_TRUSTED_ORIGINS ?? "http://localhost:3001")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

export const auth = betterAuth({
  baseURL,
  trustedOrigins: trustedOrigins.length ? trustedOrigins : undefined,
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: users,
      session: sessions,
      account: accounts,
      verification: verifications,
    },
  }),
  secret: process.env.BETTER_AUTH_SECRET as string,
  emailAndPassword: {
    enabled: true,
  },
  // Add other authentication methods as needed
});

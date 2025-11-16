import dotenv from 'dotenv';
dotenv.config();

import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import pg from 'pg';
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Main database client for Drizzle
export const client = postgres(process.env.DATABASE_URL);
export const db = drizzle(client, { schema });

// Separate connection pool for session store (connect-pg-simple requires pg.Pool)
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
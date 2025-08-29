import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

declare global {
  var __db_pool__: Pool | undefined;
}

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set');
}

export const pool: Pool = global.__db_pool__ ?? new Pool({ connectionString });
if (process.env.NODE_ENV !== 'production') {
  global.__db_pool__ = pool;
}

export const db = drizzle({ client: pool, schema });

import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '@/storage/database/shared/schema';

const globalForPool = globalThis as unknown as { pgPool: Pool | undefined };

/**
 * 使用 DATABASE_URL 直连 Postgres（绕过 Supabase PostgREST 的 RLS）。
 * 仅在配置了 DATABASE_URL 时可用。
 */
export function getDrizzleDb() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;

  if (!globalForPool.pgPool) {
    globalForPool.pgPool = new Pool({ connectionString: url, max: 10 });
  }

  return drizzle(globalForPool.pgPool, { schema });
}

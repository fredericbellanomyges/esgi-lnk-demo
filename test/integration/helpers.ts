import pg from 'pg';
import { buildApp } from '../../src/app.js';
import type { Config } from '../../src/config.js';

// Valeurs factices : les tests n'ont besoin d'aucun secret.
export const TEST_ADMIN_TOKEN = 'test-admin-token';

export const testConfig: Config = {
  databaseUrl: process.env.DATABASE_URL ?? '',
  adminToken: TEST_ADMIN_TOKEN,
  publicBaseUrl: 'http://esgi-lnk.test',
  appVersion: 'test',
  port: 0,
};

export function createTestApp() {
  const pool = new pg.Pool({ connectionString: testConfig.databaseUrl });
  const app = buildApp(testConfig, pool);
  return { app, pool };
}

export async function insertLink(
  pool: pg.Pool,
  code: string,
  url: string,
  expiresAt: Date,
  clicks = 0,
): Promise<void> {
  await pool.query('INSERT INTO links (code, url, expires_at, clicks) VALUES ($1, $2, $3, $4)', [
    code,
    url,
    expiresAt,
    clicks,
  ]);
}

export async function deleteLinks(pool: pg.Pool, ...codes: string[]): Promise<void> {
  await pool.query('DELETE FROM links WHERE code = ANY($1)', [codes]);
}

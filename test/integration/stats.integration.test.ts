import { afterAll, afterEach, beforeEach, describe, expect, it } from 'vitest';
import { TEST_ADMIN_TOKEN, createTestApp, deleteLinks, insertLink } from './helpers.js';

const { app, pool } = createTestApp();
const CODE = 'stat01';
const auth = { authorization: `Bearer ${TEST_ADMIN_TOKEN}` };

beforeEach(async () => {
  await insertLink(pool, CODE, 'https://example.com/stats', new Date(Date.now() + 86_400_000), 3);
});

afterEach(async () => {
  await deleteLinks(pool, CODE);
});

afterAll(async () => {
  await app.close();
  await pool.end();
});

describe('GET /links/:code/stats', () => {
  it('répond 401 sans token', async () => {
    const response = await app.inject({ method: 'GET', url: `/links/${CODE}/stats` });

    expect(response.statusCode).toBe(401);
  });

  it('répond 401 avec un mauvais token', async () => {
    const response = await app.inject({
      method: 'GET',
      url: `/links/${CODE}/stats`,
      headers: { authorization: 'Bearer mauvais-token' },
    });

    expect(response.statusCode).toBe(401);
  });

  it('répond 404 pour un code inconnu', async () => {
    const response = await app.inject({ method: 'GET', url: '/links/zzzzzz/stats', headers: auth });

    expect(response.statusCode).toBe(404);
  });

  it('renvoie l’URL, les clics et les dates', async () => {
    const response = await app.inject({ method: 'GET', url: `/links/${CODE}/stats`, headers: auth });
    const body = response.json<{ url: string; clicks: number; createdAt: string; expiresAt: string }>();

    expect(response.statusCode).toBe(200);
    expect(body.url).toBe('https://example.com/stats');
    expect(body.clicks).toBe(3);
    expect(new Date(body.createdAt).getTime()).not.toBeNaN();
    expect(new Date(body.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });
});

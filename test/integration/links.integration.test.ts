import { afterAll, afterEach, describe, expect, it } from 'vitest';
import { createTestApp, deleteLinks, insertLink } from './helpers.js';

const { app, pool } = createTestApp();
const createdCodes: string[] = [];

afterEach(async () => {
  // Chaque fichier ne nettoie que ses propres codes : les fichiers restent indépendants.
  await deleteLinks(pool, 'abc123', 'old001', ...createdCodes);
  createdCodes.length = 0;
});

afterAll(async () => {
  await app.close();
  await pool.end();
});

const IN_ONE_DAY = new Date(Date.now() + 24 * 60 * 60 * 1000);
const YESTERDAY = new Date(Date.now() - 24 * 60 * 60 * 1000);

describe('POST /links', () => {
  it('crée un lien et répond 201', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: { url: 'https://example.com/une/longue/url' },
    });
    const body = response.json<{ code: string; shortUrl: string; expiresAt: string }>();
    createdCodes.push(body.code);

    expect(response.statusCode).toBe(201);
    expect(body.code).toMatch(/^[A-Za-z0-9]{6}$/);
    expect(body.shortUrl).toBe(`http://esgi-lnk.test/r/${body.code}`);
    expect(new Date(body.expiresAt).getTime()).toBeGreaterThan(Date.now());
  });

  it('refuse une URL javascript:', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/links',
      payload: { url: 'javascript:alert(1)' },
    });

    expect(response.statusCode).toBe(400);
  });

  it('refuse un corps sans url', async () => {
    const response = await app.inject({ method: 'POST', url: '/links', payload: {} });

    expect(response.statusCode).toBe(400);
  });
});

describe('GET /r/:code', () => {
  it('redirige en 302 vers l’URL d’origine', async () => {
    await insertLink(pool, 'abc123', 'https://example.com/cible', IN_ONE_DAY);

    const response = await app.inject({ method: 'GET', url: '/r/abc123' });

    expect(response.statusCode).toBe(302);
    expect(response.headers.location).toBe('https://example.com/cible');
  });

  it('répond 404 pour un code inconnu', async () => {
    const response = await app.inject({ method: 'GET', url: '/r/zzzzzz' });

    expect(response.statusCode).toBe(404);
  });

  it('répond 410 pour un lien expiré', async () => {
    await insertLink(pool, 'old001', 'https://example.com/vieux', YESTERDAY);

    const response = await app.inject({ method: 'GET', url: '/r/old001' });

    expect(response.statusCode).toBe(410);
  });
});

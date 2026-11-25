import { afterAll, describe, expect, it } from 'vitest';
import { createTestApp } from './helpers.js';

const { app, pool } = createTestApp();

afterAll(async () => {
  await app.close();
  await pool.end();
});

describe('GET /health', () => {
  it('répond ok avec la version et l’état de la base', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ok', version: 'test', db: 'up' });
  });
});

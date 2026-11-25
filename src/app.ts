import Fastify from 'fastify';
import type { Pool } from 'pg';
import type { Config } from './config.js';
import { createLinksRepository } from './links/links.repository.js';
import { linksRoutes } from './links/links.routes.js';

// Construit l'instance sans écouter de port : les tests utilisent `app.inject()`.
export function buildApp(config: Config, pool: Pool) {
  const app = Fastify();

  app.get('/health', async (_request, reply) => {
    try {
      await pool.query('SELECT 1');
      return { status: 'ok', version: config.appVersion, db: 'up' };
    } catch {
      return reply.code(503).send({ status: 'error', version: config.appVersion, db: 'down' });
    }
  });

  linksRoutes(app, config, createLinksRepository(pool));
  return app;
}

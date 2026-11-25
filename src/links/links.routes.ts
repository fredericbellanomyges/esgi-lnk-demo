import type { FastifyInstance } from 'fastify';
import type { Config } from '../config.js';
import { computeExpiresAt, isExpired } from './expiry.js';
import type { LinksRepository } from './links.repository.js';
import { isAllowedUrl } from './validate-url.js';

interface CreateLinkBody {
  url: string;
  expiresInDays?: number;
}

const createLinkSchema = {
  body: {
    type: 'object',
    required: ['url'],
    properties: {
      url: { type: 'string' },
      expiresInDays: { type: 'integer', minimum: 1 },
    },
  },
} as const;

export function linksRoutes(app: FastifyInstance, config: Config, repository: LinksRepository) {
  const ownHost = new URL(config.publicBaseUrl).host;

  app.post<{ Body: CreateLinkBody }>('/links', { schema: createLinkSchema }, async (request, reply) => {
    const { url, expiresInDays } = request.body;
    if (!isAllowedUrl(url, ownHost)) {
      return reply.code(400).send({ error: 'URL refusée' });
    }
    const expiresAt = computeExpiresAt(expiresInDays);
    const code = await repository.create(url, expiresAt);
    return reply.code(201).send({
      code,
      shortUrl: `${config.publicBaseUrl}/r/${code}`,
      expiresAt: expiresAt.toISOString(),
    });
  });

  app.get<{ Params: { code: string } }>('/r/:code', async (request, reply) => {
    const link = await repository.findByCode(request.params.code);
    if (!link) {
      return reply.code(404).send({ error: 'Lien inconnu' });
    }
    if (isExpired(link)) {
      return reply.code(410).send({ error: 'Lien expiré' });
    }
    await repository.incrementClicks(link.code);
    return reply.redirect(link.url, 302);
  });

  app.get<{ Params: { code: string } }>('/links/:code/stats', async (request, reply) => {
    if (request.headers.authorization !== `Bearer ${config.adminToken}`) {
      return reply.code(401).send({ error: 'Non autorisé' });
    }
    const link = await repository.findByCode(request.params.code);
    if (!link) {
      return reply.code(404).send({ error: 'Lien inconnu' });
    }
    return {
      url: link.url,
      clicks: link.clicks,
      createdAt: link.createdAt.toISOString(),
      expiresAt: link.expiresAt.toISOString(),
    };
  });
}

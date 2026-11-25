import pg from 'pg';
import { buildApp } from './app.js';
import { loadConfig } from './config.js';
import { migrate } from './db/migrate.js';

const config = loadConfig();
const pool = new pg.Pool({ connectionString: config.databaseUrl });

await migrate(pool);

const app = buildApp(config, pool);
// 0.0.0.0 : indispensable en conteneur, sinon le port publié n'est pas joignable.
await app.listen({ host: '0.0.0.0', port: config.port });

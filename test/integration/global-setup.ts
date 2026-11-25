import pg from 'pg';
import { migrate } from '../../src/db/migrate.js';

// Crée la table une seule fois, avant que les fichiers de test ne démarrent en parallèle.
export default async function setup() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  await migrate(pool);
  await pool.end();
}

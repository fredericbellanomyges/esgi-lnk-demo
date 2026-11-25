import { describe, expect, it } from 'vitest';
import { loadConfig } from '../../src/config.js';

const ENV = { DATABASE_URL: 'postgres://u:p@localhost/db', ADMIN_TOKEN: 'test-admin-token' };

describe('loadConfig', () => {
  it('lit les variables obligatoires', () => {
    const config = loadConfig(ENV);
    expect(config.databaseUrl).toBe(ENV.DATABASE_URL);
    expect(config.adminToken).toBe('test-admin-token');
  });

  it('applique les valeurs par défaut', () => {
    const config = loadConfig(ENV);
    expect(config.publicBaseUrl).toBe('http://localhost:3000');
    expect(config.appVersion).toBe('dev');
    expect(config.port).toBe(3000);
  });

  it('refuse un DATABASE_URL manquant', () => {
    expect(() => loadConfig({ ADMIN_TOKEN: 'x' })).toThrow('DATABASE_URL');
  });

  it('refuse un ADMIN_TOKEN manquant', () => {
    expect(() => loadConfig({ DATABASE_URL: 'x' })).toThrow('ADMIN_TOKEN');
  });
});

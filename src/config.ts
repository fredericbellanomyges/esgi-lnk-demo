export interface Config {
  databaseUrl: string;
  adminToken: string;
  publicBaseUrl: string;
  appVersion: string;
  port: number;
}

function required(env: NodeJS.ProcessEnv, name: string): string {
  const value = env[name];
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${name}`);
  }
  return value;
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): Config {
  return {
    databaseUrl: required(env, 'DATABASE_URL'),
    adminToken: required(env, 'ADMIN_TOKEN'),
    publicBaseUrl: env.PUBLIC_BASE_URL ?? 'http://localhost:3000',
    appVersion: env.APP_VERSION ?? 'dev',
    port: Number(env.PORT ?? 3000),
  };
}

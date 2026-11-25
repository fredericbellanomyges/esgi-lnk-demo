const DAY_MS = 24 * 60 * 60 * 1000;

export const DEFAULT_EXPIRES_IN_DAYS = 30;

export function computeExpiresAt(
  expiresInDays: number = DEFAULT_EXPIRES_IN_DAYS,
  now: Date = new Date(),
): Date {
  return new Date(now.getTime() + expiresInDays * DAY_MS);
}

// `now` est injectable : pas besoin de manipuler l'horloge dans les tests.
export function isExpired(link: { expiresAt: Date }, now: Date = new Date()): boolean {
  return link.expiresAt.getTime() <= now.getTime();
}

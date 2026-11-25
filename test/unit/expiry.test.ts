import { describe, expect, it } from 'vitest';
import { computeExpiresAt, isExpired } from '../../src/links/expiry.js';

const NOW = new Date('2026-01-15T12:00:00Z');

describe('computeExpiresAt', () => {
  it('expire après 30 jours par défaut', () => {
    expect(computeExpiresAt(undefined, NOW)).toEqual(new Date('2026-02-14T12:00:00Z'));
  });

  it('expire après le nombre de jours demandé', () => {
    expect(computeExpiresAt(7, NOW)).toEqual(new Date('2026-01-22T12:00:00Z'));
  });

  it('utilise l’heure courante si `now` est omis', () => {
    const before = Date.now();
    const expiresAt = computeExpiresAt(1).getTime();
    expect(expiresAt).toBeGreaterThanOrEqual(before + 24 * 60 * 60 * 1000);
  });
});

describe('isExpired', () => {
  it('n’est pas expiré avant la date d’expiration', () => {
    const link = { expiresAt: new Date('2026-01-15T12:00:01Z') };
    expect(isExpired(link, NOW)).toBe(false);
  });

  it('est expiré après la date d’expiration', () => {
    const link = { expiresAt: new Date('2026-01-15T11:59:59Z') };
    expect(isExpired(link, NOW)).toBe(true);
  });

  it('est expiré à l’instant exact d’expiration', () => {
    expect(isExpired({ expiresAt: NOW }, NOW)).toBe(true);
  });

  it('un lien créé pour 30 jours est valide au bout de 29 jours', () => {
    const link = { expiresAt: computeExpiresAt(30, NOW) };
    const in29Days = new Date('2026-02-13T12:00:00Z');
    expect(isExpired(link, in29Days)).toBe(false);
  });

  it('un lien créé pour 30 jours est expiré au bout de 31 jours', () => {
    const link = { expiresAt: computeExpiresAt(30, NOW) };
    const in31Days = new Date('2026-02-15T12:00:00Z');
    expect(isExpired(link, in31Days)).toBe(true);
  });

  it('utilise l’heure courante si `now` est omis', () => {
    expect(isExpired({ expiresAt: new Date('2000-01-01T00:00:00Z') })).toBe(true);
    expect(isExpired({ expiresAt: new Date('2999-01-01T00:00:00Z') })).toBe(false);
  });
});

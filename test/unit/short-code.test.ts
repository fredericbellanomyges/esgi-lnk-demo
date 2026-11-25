import { describe, expect, it } from 'vitest';
import { generateShortCode } from '../../src/links/short-code.js';

// Générateur déterministe : renvoie les valeurs données, en boucle.
function sequence(...values: number[]): () => number {
  let i = 0;
  return () => values[i++ % values.length] as number;
}

describe('generateShortCode', () => {
  it('produit 6 caractères', () => {
    expect(generateShortCode()).toHaveLength(6);
  });

  it('produit uniquement des caractères alphanumériques', () => {
    expect(generateShortCode()).toMatch(/^[A-Za-z0-9]{6}$/);
  });

  it('utilise le générateur injecté', () => {
    expect(generateShortCode(() => 0)).toBe('AAAAAA');
  });

  it('peut produire des majuscules, des minuscules et des chiffres', () => {
    const code = generateShortCode(sequence(0, 26 / 62, 52 / 62));
    expect(code).toBe('Aa0Aa0');
  });

  it('reste dans l’alphabet pour la valeur limite du générateur', () => {
    expect(generateShortCode(() => 0.999999)).toBe('999999');
  });
});

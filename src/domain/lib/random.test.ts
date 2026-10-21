import { describe, expect, it } from 'vitest';
import { createRandom, shuffle } from './random';

describe('createRandom', () => {
  it('is deterministic for a seed and stays within [0, 1)', () => {
    const a = createRandom(42);
    const b = createRandom(42);
    const values = Array.from({ length: 1000 }, () => a());
    expect(values).toEqual(Array.from({ length: 1000 }, () => b()));
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
  });

  it('differs between seeds', () => {
    expect(createRandom(1)()).not.toBe(createRandom(2)());
  });
});

describe('shuffle', () => {
  it('returns a permutation without mutating the input', () => {
    const input = Object.freeze([1, 2, 3, 4, 5, 6, 7, 8]);
    const output = shuffle(input, createRandom(7));
    expect([...output].sort((x, y) => x - y)).toEqual([...input]);
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it('is reproducible with the same seed', () => {
    expect(shuffle([1, 2, 3, 4, 5], createRandom(9))).toEqual(
      shuffle([1, 2, 3, 4, 5], createRandom(9)),
    );
  });

  it('handles empty and single-item lists', () => {
    expect(shuffle([], createRandom(1))).toEqual([]);
    expect(shuffle(['x'], createRandom(1))).toEqual(['x']);
  });
});

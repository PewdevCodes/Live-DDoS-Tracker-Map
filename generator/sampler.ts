// building the weighted sampler

import type { AttackPair } from '../radar-schema.js';

export interface WeightedAttackPair {
  origin: string;
  target: string;
  weight: number;
}

export function buildWeightedPool(pairs: AttackPair[]): WeightedAttackPair[] {
  const validPairs = pairs.filter(
    (pair) => Number.isFinite(pair.value) && pair.value > 0,
  );

  const totalWeight = validPairs.reduce((sum, pair) => sum + pair.value, 0);

  if (totalWeight <= 0) {
    throw new Error('Cannot build a pool with zero total weight.');
  }

  return validPairs.map((pair) => ({
    origin: pair.originCountryAlpha2,
    target: pair.targetCountryAlpha2,
    weight: pair.value / totalWeight,
  }));
}

export function sampleAttackPair(
  pool: WeightedAttackPair[],
): WeightedAttackPair {
  if (pool.length === 0) {
    throw new Error('Cannot sample from an empty pool.');
  }

  const randomValue = Math.random();
  let cumulativeWeight = 0;

  for (const pair of pool) {
    cumulativeWeight += pair.weight;

    if (randomValue < cumulativeWeight) {
      return pair;
    }
  }

  // Protect against floating-point rounding at the upper boundary.
  return pool[pool.length - 1]!;
}

/*
 buildWeightedPool() -> converts the API values into probabilities that sum to approximately 1.
 sampleAttackPair() -> generates a random number between 0 and 1 and selects the pair whose cumulative probability contains that number.

*/


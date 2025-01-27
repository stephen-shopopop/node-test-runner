import { num } from './random-number.js';

/**
 * Get random from array
 *
 * @param data
 */
function getRandomFromArray<T>(data: T[]): T {
  const prng = num.getRandomInRange({ max: data.length - 1, min: 0 });

  return data.at(prng) as T;
}

export const array = { getRandomFromArray };

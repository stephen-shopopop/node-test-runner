import { num } from './random-number.js';

/**
 *  Get random item from array
 *  This function selects a random item from the provided array.
 *
 * @param data Array of items to choose from
 * @template T Type of items in the array
 * @description This function selects a random item from the provided array.
 * It uses a pseudo-random number generator to determine the index of the item to return.
 * If the array is empty, it will return undefined.
 * @returns A random item from the array or undefined if the array is empty.
 */
function getRandomFromArray<T>(data: T[]): T | undefined {
  const prng = num.getRandomInRange({ max: data.length - 1, min: 0 });

  return data.at(prng) as T;
}

export const array = { getRandomFromArray };

import { num } from './random-number.js';

/**
 * Normalize date to Date object
 *
 * @param date string | Date | number
 * @returns Date
 */
function normalizeDate(date: string | Date | number): Date {
  return new Date(date);
}

/**
 *  Generate a random date between two specified dates
 *  This function generates a random date between two specified dates.
 *
 * @param param0 from date
 * @param param1 to date
 * @description This function generates a random date between two specified dates.
 * It takes two parameters, `from` and `to`, which can be strings, Date objects, or numbers representing timestamps.
 * The function normalizes these inputs to Date objects and then generates a random timestamp between the two dates.
 * The result is returned as a Date object.
 * @example
 * const randomDate = date.between({ from: '2023-01-01', to: '2023-12-31' });
 * console.log(randomDate); // Outputs a random date between January 1, 2023, and December 31, 2023.
 * @returns
 */
function between({ from, to }: { from: string | Date | number; to: string | Date | number }): Date {
  const fromInMs = normalizeDate(from).getTime();
  const toInMs = normalizeDate(to).getTime();

  return new Date(num.getRandomInRange({ max: toInMs, min: fromInMs }));
}

/**
 * Generates a random date between two specified dates.
 * This function generates a random date between two specified dates.
 */
export const date = Object.freeze({ between });

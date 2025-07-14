import { num } from './random-number.js';

function normalizeDate(date: string | Date | number): Date {
  return new Date(date);
}

/**
 * Random between date
 *
 * @param param0 date from
 * @param param1 date to
 * @returns
 */
function between({ from, to }: { from: string | Date | number; to: string | Date | number }): Date {
  const fromInMs = normalizeDate(from).getTime();
  const toInMs = normalizeDate(to).getTime();

  return new Date(num.getRandomInRange({ max: toInMs, min: fromInMs }));
}

export const date = Object.freeze({ between });

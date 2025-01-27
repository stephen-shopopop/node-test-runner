/**
 * Get random number in range
 *
 * @param param0 min value
 * @param param1 max value
 * @param param2 double precision
 * @returns
 */
function getRandomInRange({
  min = 1.0,
  max = 9999.99,
  fraction = 0
}: {
  min?: number;
  max?: number;
  fraction?: number;
} = {}): number {
  if (max < min) {
    throw new Error('Max must be bigger than min');
  }

  if (min === max) {
    return min;
  }

  return Number((Math.random() * (max - min) + min).toFixed(fraction));
}

export const num = { getRandomInRange };

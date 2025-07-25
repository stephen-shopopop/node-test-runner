/**
 * Get random number in range
 * This function generates a random number within a specified range.
 *
 * @param param0 min value
 * @param param1 max value
 * @param param2 fraction digits
 * @description This function generates a random number within a specified range.
 * It takes an object with optional properties `min`, `max`, and `fraction`.
 * The `min` and `max` properties define the range, while `fraction` specifies
 * the number of decimal places to round the result.
 * If `min` is greater than or equal to `max`, it throws an error.
 * If `min` and `max` are equal, it returns `min`.
 * The function uses `Math.random()` to generate a random number within the specified range,
 * and then rounds it to the specified number of decimal places.
 * @returns A random number within the specified range, rounded to the specified number of decimal places.
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

/**
 * Get random number in range
 * This function generates a random number within a specified range.
 */
export const num = { getRandomInRange };

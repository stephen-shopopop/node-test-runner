import { num } from './random-number.js';

/**
 * Generates a random string of characters from the specified alphabet.
 * This function generates a random string of characters from the specified alphabet.
 *
 * @param alphabet string
 * @description This function generates a random string of characters from the specified alphabet.
 * It takes an optional parameter `length` which defines the length of the generated string.
 * If no length is provided, it defaults to 8 characters.
 * @param length - The length of the random string to generate. Default is 8.
 * @returns A random string of characters from the specified alphabet.
 */
function randomAlphabet(alphabet: string, length = 8): string {
  let chars = '';

  for (let i = 0; i < length; i++) {
    const prng = num.getRandomInRange({ max: alphabet.length - 1, min: 0 });

    chars += alphabet.charAt(prng);
  }

  return chars;
}

/**
 *  Generates a random string of characters from the specified alphabet.
 *  This function generates a random string of characters from the specified alphabet.
 *
 * @param length chars length randomize
 * @description This function generates a random string of characters from the specified alphabet.
 * It takes an optional parameter `length` which defines the length of the generated string.
 * If no length is provided, it defaults to 8 characters.
 * The function uses a pseudo-random number generator to select characters from the provided alphabet.
 * The alphabet can include uppercase and lowercase letters, as well as digits.
 * The generated string is returned as the result.
 * @example
 * const randomString = text.randomChars(10);
 * console.log(randomString); // Outputs a random string of 10 characters.
 * @param length - The length of the random string to generate. Default is 8.
 * @returns A random string of characters from the specified alphabet.
 */
function randomChars(length = 8): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  return randomAlphabet(alphabet, length);
}

/**
 *  Generates a random string of characters from the base32 alphabet.
 *  This function generates a random string of characters from the base32 alphabet.
 *
 * @param length chars length randomize
 * @description This function generates a random string of characters from the base32 alphabet.
 * The base32 alphabet consists of uppercase letters and digits, excluding characters that can be easily confused
 * (like '0' and 'O', '1' and 'I'). The function takes an optional parameter `length` which defines the length of the generated string.
 * If no length is provided, it defaults to 8 characters.
 * The function uses a pseudo-random number generator to select characters from the base32 alphabet.
 * The generated string is returned as the result.
 * @example
 * const randomBase32String = text.randomBase32(10);
 * console.log(randomBase32String); // Outputs a random string of 10 characters from the base32 alphabet.
 * @param length - The length of the random string to generate. Default is 8.
 * @returns A random string of characters from the base32 alphabet.
 */
function randomBase32(length = 8): string {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTUVWXZ';

  return randomAlphabet(alphabet, length);
}

/**
 * Generates a random string of characters from the base32 alphabet.
 * This function generates a random string of characters from the base32 alphabet.
 */
export const text = { randomBase32, randomChars };

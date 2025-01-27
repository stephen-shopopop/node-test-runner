import { num } from './random-number.js';

function randomAlphabet(alphabet: string, length = 8): string {
  let chars = '';

  for (let i = 0; i < length; i++) {
    const prng = num.getRandomInRange({ max: alphabet.length - 1, min: 0 });

    chars += alphabet.charAt(prng);
  }

  return chars;
}

/**
 * Random chars
 *
 * @param length chars length randomize
 */
function randomChars(length = 8): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

  return randomAlphabet(alphabet, length);
}

/**
 * Random chars base32
 *
 * @param length chars length randomize
 */
function randomBase32(length = 8): string {
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTUVWXZ';

  return randomAlphabet(alphabet, length);
}

export const text = { randomBase32, randomChars };

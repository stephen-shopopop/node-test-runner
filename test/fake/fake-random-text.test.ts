import { expect, fake } from '#runner';
import { describe, it } from 'node:test';

describe('Fake random text', () => {
  describe('randomChars', () => {
    it('Should return randomChars length 8 ', () => {
      // Act
      const value = fake.text.randomChars();

      // Expect
      expect(value).toHaveLength(8);
    });

    it('Should return randomChars length 12 ', () => {
      // Arrange
      const len = 12;
      // Act
      const value = fake.text.randomChars(len);

      // Expect
      expect(value).toHaveLength(len);
    });
  });

  describe('randomBase32', () => {
    it('Should return randomChars length 8 ', () => {
      // Act
      const value = fake.text.randomBase32();

      // Expect
      expect(value).toHaveLength(8);
    });

    it('Should return randomChars length 12 ', () => {
      // Arrange
      const len = 12;
      // Act
      const value = fake.text.randomBase32(len);

      // Expect
      expect(value).toHaveLength(len);
    });
  });
});

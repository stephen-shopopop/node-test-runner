import { fake } from '#runner';
import { describe, it, type TestContext } from 'node:test';

describe('Fake random text', () => {
  describe('randomChars', () => {
    it('Should return randomChars length 8 ', (t: TestContext) => {
      t.plan(1);

      // Act
      const value = fake.text.randomChars();

      // Expect
      t.assert.equal(value.length, 8);
    });

    it('Should return randomChars length 12 ', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const len = 12;
      // Act
      const value = fake.text.randomChars(len);

      // Expect
      t.assert.equal(value.length, len);
    });
  });

  describe('randomBase32', () => {
    it('Should return randomChars length 8 ', (t: TestContext) => {
      t.plan(1);

      // Act
      const value = fake.text.randomBase32();

      // Expect
      t.assert.equal(value.length, 8);
    });

    it('Should return randomChars length 12 ', (t: TestContext) => {
      t.plan(1);

      // Arrange
      const len = 12;
      // Act
      const value = fake.text.randomBase32(len);

      // Expect
      t.assert.equal(value.length, len);
    });
  });
});

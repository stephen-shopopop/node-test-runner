import { fake } from '#runner';
import { describe, it, type TestContext } from 'node:test';

describe('Fake random number', () => {
  it('Should return number float', (t: TestContext) => {
    // Arrange
    t.mock.method(global.Math, 'random').mock.mockImplementation(() => 0.123456789);

    // Act
    const value = fake.num.getRandomInRange({ fraction: 2 });

    // Expect
    t.assert.equal(Number(value) === value && value % 1 === 0, false);
    t.assert.strictEqual(value, 1235.44);
  });

  it('Should return number integer', (t: TestContext) => {
    // Arrange
    t.mock.method(global.Math, 'random').mock.mockImplementation(() => 0.123456789);

    // Act
    const value = fake.num.getRandomInRange();

    // Assert
    t.assert.equal(Number(value) === value && value % 1 === 0, true);
    t.assert.strictEqual(value, 1235);
  });

  it('Should return min value, if min === max', (t: TestContext) => {
    // Arrange
    t.mock.method(global.Math, 'random').mock.mockImplementation(() => 0.123456789);

    // Act
    const value = fake.num.getRandomInRange({ max: 10, min: 10 });

    // Assert
    t.assert.strictEqual(value, 10);
  });

  it('Should return error, if min > max', (t: TestContext) => {
    // Arrange
    t.mock.method(global.Math, 'random').mock.mockImplementation(() => 0.123456789);

    // Act
    const random = () => fake.num.getRandomInRange({ max: 10, min: 11 });

    // Assert
    t.assert.throws(random, new Error('Max must be bigger than min'));
  });
});

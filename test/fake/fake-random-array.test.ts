import { fake } from '#runner';
import { describe, it, type TestContext } from 'node:test';

describe('Fake random array', () => {
  it('Should return first item of array', (t: TestContext) => {
    // Arrange
    const data = [1, 999];

    t.mock.method(global.Math, 'random').mock.mockImplementation(() => 0.123456789);

    // Act
    const value = fake.array.getRandomFromArray(data);

    // Expect
    t.assert.strictEqual(value, 1);
  });
});

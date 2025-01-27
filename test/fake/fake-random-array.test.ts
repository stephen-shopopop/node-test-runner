import { describe, expect, fake, it } from '#runner';

describe('Fake random array', () => {
  it('Should return first item of array', (t) => {
    // Arrange
    const data = [1, 999];

    t.mock.method(global.Math, 'random').mock.mockImplementation(() => 0.123456789);

    // Act
    const value = fake.array.getRandomFromArray(data);

    // Expect
    expect(value).toBe(1);
  });
});

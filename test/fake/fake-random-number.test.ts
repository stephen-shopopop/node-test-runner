import { describe, expect, fake, it } from '#runner';

describe('Fake random number', () => {
  it('Should return number float', (t) => {
    // Arrange
    t.mock.method(global.Math, 'random').mock.mockImplementation(() => 0.123456789);

    // Act
    const value = fake.num.getRandomInRange({ fraction: 2 });

    // Expect
    expect(Number(value) === value && value % 1 === 0).toBeFalsy();
    expect(value).toBe(1235.44);
  });

  it('Should return number integer', (t) => {
    // Arrange
    t.mock.method(global.Math, 'random').mock.mockImplementation(() => 0.123456789);

    // Act
    const value = fake.num.getRandomInRange();

    // Assert
    expect(Number(value) === value && value % 1 === 0).toBeTruthy();
    expect(value).toBe(1235);
  });

  it('Should return min value, if min === max', (t) => {
    // Arrange
    t.mock.method(global.Math, 'random').mock.mockImplementation(() => 0.123456789);

    // Act
    const value = fake.num.getRandomInRange({ max: 10, min: 10 });

    // Assert
    expect(value).toBe(10);
  });
});

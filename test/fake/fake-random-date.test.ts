import { describe, expect, fake, it } from '#runner';

describe('Fake random date', () => {
  it('Should return instance of Date', () => {
    // Act
    const value = fake.date.between({ from: Date.now(), to: Date.now() });

    // Expect
    expect(value).toBeInstanceOf(Date);
  });
});

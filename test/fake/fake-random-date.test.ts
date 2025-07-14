import { expect, fake } from '#runner';
import { describe, it } from 'node:test';

describe('Fake random date', () => {
  it('Should return instance of Date', () => {
    // Act
    const value = fake.date.between({ from: Date.now(), to: Date.now() });

    // Expect
    expect(value).toBeInstanceOf(Date);
  });
});

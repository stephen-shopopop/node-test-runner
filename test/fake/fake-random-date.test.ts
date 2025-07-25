import { fake } from '#runner';
import { describe, it, type TestContext } from 'node:test';

describe('Fake random date', () => {
  it('Should return instance of Date', (t: TestContext) => {
    t.plan(1);

    // Act
    const value = fake.date.between({ from: Date.now(), to: Date.now() });

    // Expect
    t.assert.ok(value instanceof Date);
  });
});

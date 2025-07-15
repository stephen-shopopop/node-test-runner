import test, { describe } from 'node:test';

describe('Setup', () => {
  test('synchronous passing test', (t) => {
    // This test passes because it does not throw an exception.
    t.assert.strictEqual(1, 1);
  });

  test('Timezone passing test', (t) => {
    // This test passes because it does not throw an exception.
    t.assert.strictEqual(process.env.TZ, 'UTC');
  });
});

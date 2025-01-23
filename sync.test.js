import test from 'node:test';
import assert from 'node:assert';

test('synchronous passing test', () => {
  // This test passes because it does not throw an exception.
  assert.strictEqual(1, 1);
});

test('Timezone passing test', () => {
  // This test passes because it does not throw an exception.
  assert.strictEqual(process.env.TZ, 'UTC');
});

import assert from 'node:assert';
import test from 'node:test';

test('synchronous passing test #unit', () => {
  // This test passes because it does not throw an exception.
  assert.strictEqual(1, 1);
});

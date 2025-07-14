import assert from 'node:assert';
import { expect } from '#runner';
import test from 'node:test';

test('synchronous passing test #unit', () => {
  // This test passes because it does not throw an exception.
  assert.strictEqual(1, 1);
});

test('expect deno usage', () => {
  expect(1).toBeTruthy();
});

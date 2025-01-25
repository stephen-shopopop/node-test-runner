import assert from 'node:assert';
import test from 'node:test';
import { expect } from '@std/expect';

test('synchronous passing test #unit', () => {
  // This test passes because it does not throw an exception.
  assert.strictEqual(1, 1);
});

test('expect deno usage', () => {
  expect(1).toBeTruthy();
});

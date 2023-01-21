/* eslint-disable import/no-unresolved */
const test = require('ava').default;

// Test to pass.
test('Test to pass', (t) => {
  t.pass();
});

test('Test value', async (t) => {
  const a = 1;
  t.is(a + 1, 2);
});

const sum = (a, b) => a + b;

// Asserts that the sum of 2 numbers is 1. 2.
test('Sum of 2 numbers', (t) => {
  t.plan(2);
  t.pass('this assertion passed');
  t.is(sum(1, 2), 3);
});

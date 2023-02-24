/* eslint-disable import/no-unresolved */
const test = require('ava').default;

// Random test to pass
test('Test to pass', (t) => {
  t.pass();
});

// Showing how testing works
test('Test value', async (t) => {
  const a = 1;
  t.is(a + 1, 2);
});

const sum = (a, b) => a + b;

// Testing the summary of two numbers
test('Sum of 2 numbers', (t) => {
  t.plan(2);
  t.pass('this assertion passed');
  t.is(sum(1, 2), 3);
});

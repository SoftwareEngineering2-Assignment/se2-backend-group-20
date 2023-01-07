/* eslint-disable import/no-unresolved */

// prepare for testing and do the needed imports
const test = require('ava').default;
const listen = require('test-listen');
const got = require('got');
const http = require('node:http');
const app = require('../src/index');
const {jwtSign} = require('../src/utilities/authentication/helpers');
const { authenticate } = require('../src/utilities/validation/schemas');

// before running the tests setup the test environment
test.before(async (t) => {
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  t.context.got = got.extend({ http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl })
});

// after the test close all the pending matters
test.after((t) => {
  t.context.server.close();
});

/*
  Tests for general routes
*/

test('GET | /statistics | returns correct status code', async (t) => {
  const {statusCode, body} = await t.context.got('general/statistics');
  t.is(statusCode, 200);
  t.assert(body.success);
  t.is(body.sources, 0);
});

test('GET | /test-url', async (t) => {
  const { statusCode } = await t.context.got('general/test-url');
  t.is(statusCode, 200);
});

test('GET | /test-url-request', async (t) => {
  const { statusCode, body } = await t.context.got('general/test-url-request', { type: 'GET' });
  t.is(statusCode, 200);
  console.log(body);
});
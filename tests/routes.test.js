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


test('GET | /statistics | returns correct status code', async (t) => {
  const {statusCode, body} = await t.context.got('general/statistics');
  t.is(statusCode, 200);
  t.assert(body.success);
  t.is(body.sources, 0);
});

test('GET | /sources', async (t) => {
  const token = jwtSign({ username: "karanikio", id: "603240b6bc3cb735d09ee880", email: 'karanikio@auth.gr' });
  const { statusCode, body } = await t.context.got(`sources/sources?token=${token}`);
  t.is(statusCode, 200);
});

test('POST | /create-dashboard', async (t) => {
  const token = jwtSign({ username: "karanikio", id: "603240b6bc3cb735d09ee880", email: 'karanikio@auth.gr' });
  const { statusCode, body } = await t.context.got(`sources/create-dashboard?token=${token}`, { name: "mydash" });
  console.log(body.success);
});

// test('GET | /dashboards', async (t) => {
//   const token = jwtSign({ a: 1 });
//   const { statusCode, body } = await t.context.got(`sources/dashboards?token=${token}`);
//   t.assert(body.success);
// });
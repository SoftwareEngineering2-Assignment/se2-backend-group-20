/* eslint-disable import/no-unresolved */
require('dotenv').config();

const http = require('node:http');
const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');

const app = require('../src/index');
const {jwtSign} = require('../src/utilities/authentication/helpers');

// Creates a server and listens for requests.
test.before(async (t) => {
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  t.context.got = got.extend({http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl});
});

// Finally delete the dashboard
test('POST | /delete-dashboard', async (t) => {
  const token = jwtSign({ username: process.env.USERNAME, id: process.env.ID, email: process.env.EMAIL });
  const dash_id = { id: "63d10d521ebb263904b07b0e" }
  const answer = await axios.post(`http://localhost:3000/dashboards/delete-dashboard?token=${token}`, dash_id);
  t.is(answer.status, 200);
});

// Closes the test server.
test.after.always((t) => {
  t.context.server.close();
});

// Returns the correct response and status code.
test('GET /statistics returns correct response and status code', async (t) => {
  const {body, statusCode} = await t.context.got('general/statistics');
  t.is(body.sources, 1);
  t.assert(body.success);
  t.is(statusCode, 200);
});

// Get a list of sources
test('GET /sources returns correct response and status code', async (t) => {
  const token = jwtSign({id: 1});
  const {statusCode} = await t.context.got(`sources/sources?token=${token}`);
  t.is(statusCode, 200);
});

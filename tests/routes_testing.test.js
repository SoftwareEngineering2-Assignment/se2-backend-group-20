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
  t.is(body.sources, 1)
});

test('GET | /test-url', async (t) => {
  const { statusCode } = await t.context.got('general/test-url');
  t.is(statusCode, 200);
});

test('GET | /test-url-request', async (t) => {

  const { statusCode, body } = await t.context.got('general/test-url-request', { type: 'GET' });
  t.is(statusCode, 200);

});


// /*
//   Tests for dashboards routes
// */

// First create a dashboard (working)
// test('POST | /create-dashboard', async (t) => {
//   const token = jwtSign({ username: process.env.USERNAME, id: process.env.ID, email: process.env.EMAIL });
//   const dashboard_name = {name: "mydash4"}
//   const answer = await axios.post(`http://localhost:3000/dashboards/create-dashboard?token=${token}`, dashboard_name);
//   t.is(answer.status, 200);
//   console.log(answer.body)
// });

//Then find the created dashboard (working)
test('GET | /dashboards', async (t) => {
  const token = jwtSign({ username: process.env.USERNAME, id: process.env.ID, email: process.env.EMAIL });
  const { statusCode, body } = await t.context.got(`dashboards/dashboards?token=${token}`);
  t.is(statusCode, 200);
  console.log(body.dashboards);
});

// Finally delete the dashboard (working) (if not working maybe change the id of the dashboard)
// test('POST | /delete-dashboard', async (t) => {
//   const token = jwtSign({ username: process.env.USERNAME, id: process.env.ID, email: process.env.EMAIL });
//   const dash_id = { id: "63d10d521ebb263904b07b0e" }
//   const answer = await axios.post(`http://localhost:3000/dashboards/delete-dashboard?token=${token}`, dash_id);
//   t.is(answer.status, 200);
// });

// Get dashboard and sources (not working)
// test('GET | /dashboard', async (t) => {
//     const token = jwtSign({ username: process.env.USERNAME, id: process.env.ID, email: process.env.EMAIL });
//     const dash_id = { id: "63d10d521ebb263904b07b0e" };
//     const { statusCode } = await axios.post(`dashboards/dashboard?token=${token}`, dash_id);
//     t.is(statusCode, 200);
//   });


// /*
//   Tests for sources routes
// */

// get every available source
test('GET | /sources', async (t) => {
  const token = jwtSign({ username: process.env.USERNAME, id: process.env.ID, email: process.env.EMAIL });
  const { statusCode, body } = await t.context.got(`sources/sources?token=${token}`);
  t.is(statusCode, 200);
});
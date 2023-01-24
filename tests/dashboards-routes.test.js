// prepare for testing and do the needed imports
const test = require('ava').default;
const listen = require('test-listen');
const got = require('got');
const http = require('node:http');
const app = require('../src/index');
const {jwtSign} = require('../src/utilities/authentication/helpers');
const { authenticate } = require('../src/utilities/validation/schemas');

// // before running the tests setup the test environment
// test.before(async (t) => {
//   t.context.server = http.createServer(app);
//   t.context.prefixUrl = await listen(t.context.server);
//   t.context.got = got.extend({ http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl })
// });

// // after the test close all the pending matters
// test.after((t) => {
//   t.context.server.close();
// });

// /*
//   Tests for dashboards routes
// */

// First create a dashboard
// test('POST | /create-dashboard', async (t) => {
//   const token = jwtSign({ username: "karanikio", id: "603240b6bc3cb735d09ee880", email: 'karanikio@auth.gr' });
//   const { statusCode, body } = await t.context.got(`dashboards/create-dashboard?token=${token}`, { name: "mydash" });
//   t.assert(body.success);
// });

//Then find the created dashboard
// test('GET | /dashboards', async (t) => {
//   const token = jwtSign({ username: "karanikio", id: "603240b6bc3cb735d09ee880", email: 'karanikio@auth.gr' });
//   const { statusCode, body } = await t.context.got(`dashboards/dashboards?token=${token}`);
//   t.assert(body.success);
// });

// Finally delete the dashboard
// test('POST | /delete-dashboard', async (t) => {
//   const token = jwtSign({ username: "karanikio", id: "603240b6bc3cb735d09ee880", email: 'karanikio@auth.gr' });
//   const { statusCode, body } = await t.context.got(`dashboards/delete-dashboard?token=${token}`, { name: "mydash" });
//   console.log(body.success);
//   t.assert(body.success);
// });
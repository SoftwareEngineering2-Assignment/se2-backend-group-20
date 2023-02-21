/*
Tests for users routes
*/
/* eslint-disable import/no-unresolved */
require('dotenv').config();

const http = require('node:http');
const test = require('ava').default;
const got = require('got');
const listen = require('test-listen');

const app = require('../src/index');
const {jwtSign} = require('../src/utilities/authentication/helpers');

// Make sure the server is listening
test.before(async (t) => {
  t.context.server = http.createServer(app);
  t.context.prefixUrl = await listen(t.context.server);
  t.context.got = got.extend({http2: true, throwHttpErrors: false, responseType: 'json', prefixUrl: t.context.prefixUrl});
});

// Always close the server
test.after.always((t) => {
  t.context.server.close();
});

// Create new user
test('POST /create create new user', async (t) => {
    // Required info for a new user 
    const newuser = {username: 'myuser1', password: 'mypassword123', email: 'myemail1@gmail.com'};
    const {body, statusCode} = await t.context.got.post('users/create', {json: newuser});

    t.assert(body.success);
    t.is(statusCode, 200);
  });

// Authenticate existing user
test('POST /authenticate user', async (t) => {
    // Provide credentials
    const loginuser = {username: 'andreas', password: 'andreas123andreas'};
    const {body, statusCode} = await t.context.got.post('users/authenticate', {json: loginuser});

    t.is(body.user.username, 'andreas');
    t.is(statusCode, 200);
  });
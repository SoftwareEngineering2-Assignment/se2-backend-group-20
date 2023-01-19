/**
 * schemas used for validation
 */
const {isNil} = require('ramda');

const yup = require('yup');
const {min} = require('./constants');

// email schema
const email = yup
  .string()
  .lowercase()
  .trim()
  .email();

// username schema
const username = yup
  .string()
  .trim();

// password schema
const password = yup
  .string()
  .trim()
  .min(min);

const request = yup.object().shape({username: username.required()});

// authentication schema
const authenticate = yup.object().shape({
  username: username.required(),
  password: password.required()
});

// register schema
const register = yup.object().shape({
  email: email.required(),
  password: password.required(),
  username: username.required()
});

// update schema
const update = yup.object().shape({
  username,
  password
}).test({
  message: 'Missing parameters',
  test: ({username: u, password: p}) => !(isNil(u) && isNil(p))
});

const change = yup.object().shape({password: password.required()});

module.exports = {
  authenticate, register, request, change, update
};

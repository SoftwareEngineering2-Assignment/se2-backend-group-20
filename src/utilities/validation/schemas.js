const {isNil} = require('ramda');

const yup = require('yup');
const {min} = require('./constants');

// Validator for email input

const email = yup
  .string()
  .lowercase()
  .trim()
  .email();

// Validator for username input 
const username = yup
  .string()
  .trim();

// Validator for password input
const password = yup
  .string()
  .trim()
  .min(min);

// Validator for forgot password form
// checks for username input
const request = yup.object().shape({username: username.required()});

// Validator for sign in form
// checks for username and password
const authenticate = yup.object().shape({
  username: username.required(),
  password: password.required()
});

// Validator for sign up form
// checks for username and password and email input
const register = yup.object().shape({
  email: email.required(),
  password: password.required(),
  username: username.required()
});

// Validator for update profile form
// checks for username and password
const update = yup.object().shape({
  username,
  password
}).test({
  message: 'Missing parameters',
  test: ({username: u, password: p}) => !(isNil(u) && isNil(p))
});

// Validator for change password form
// checks for password
const change = yup.object().shape({password: password.required()});

module.exports = {
  authenticate, register, request, change, update
};

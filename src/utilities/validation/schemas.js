const {isNil} = require('ramda');

const yup = require('yup');
const {min} = require('./constants');

/*
* Validator for email input
*/
const email = yup
  .string()
  .lowercase()
  .trim()
  .email();

/*
* Validator for username input
*/
const username = yup
  .string()
  .trim();

/*
* Validator for password input
*/
const password = yup
  .string()
  .trim()
  .min(min);

/*
* Validator for forgot password form
* Checks for username input only
*/
const request = yup.object().shape({username: username.required()});

/*
* Validator for sign-in form
* Checks for username and password input (required)
*/
const authenticate = yup.object().shape({
  username: username.required(),
  password: password.required()
});

/*
* Validator for register form
* Checks for email, username and password input (required)
*/
const register = yup.object().shape({
  email: email.required(),
  password: password.required(),
  username: username.required()
});

/*
* Validator for update profile form
* Username & Password are requested
*/
const update = yup.object().shape({
  username,
  password
}).test({
  message: 'Missing parameters',
  test: ({username: u, password: p}) => !(isNil(u) && isNil(p))
});

/*
* Validator for change password form
* Requires new password 
*/
const change = yup.object().shape({password: password.required()});

module.exports = {
  authenticate, register, request, change, update
};

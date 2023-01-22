/* eslint-disable no-console */
const {pipe, has, ifElse, assoc, identity, allPass, propEq} = require('ramda');

const withFormatMessageForProduction = ifElse(
  allPass([propEq('status', 500), () => process.env.NODE_ENV === 'production']),
  assoc('message', 'Internal server error occurred.'),
  identity
);

module.exports = (error, req, res, next ) => 
  /**
     * @name error
     * @description Middleware that handles errors
     */
  pipe(
    (e) => ({...e, message: e.message}),
    ifElse(has('status'), identity, assoc('status', 500)),
    withFormatMessageForProduction,
    (fError) => res.status(fError.status).json(fError)
  )(error);

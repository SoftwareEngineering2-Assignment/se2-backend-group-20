/**
 * configuration file for mailer utility
 */
const password = require('./password');
const send = require('./send');

module.exports = {
  mail: password,
  send
};

/**
 * Helper functions for the app
 */
const {genSaltSync, hashSync, compareSync} = require('bcryptjs');
const {sign} = require('jsonwebtoken');
const {pipe} = require('ramda');

module.exports = {
  /**
     * @name passwordDigest
     * @description Is used to hash the password before saving it to the db
     */
  passwordDigest: (password, saltWorkFactor = 10) =>
    pipe(
      genSaltSync,
      (salt) => hashSync(password, salt)
    )(saltWorkFactor),

  /**
     * @name comparePassword
     * @description Is used to compare password with hash
     */
  comparePassword: (password, hash) => compareSync(password, hash),
  
  /**
     * @name jwtSign
     * @description Is used to sign jwt with payload (after authenticate)
     */
  jwtSign: (payload) => sign(payload, process.env.SERVER_SECRET),
};

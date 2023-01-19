/**
 * configuration file for all the user routes of the app
 */
const express = require('express');
const {validation, authorization} = require('../middlewares');
const {helpers: {jwtSign}} = require('../utilities/authentication');

const {mailer: {mail, send}} = require('../utilities');

// initialize router
const router = express.Router();

const User = require('../models/user');
const Reset = require('../models/reset');

// create a user (POST)
router.post('/create',
  (req, res, next) => validation(req, res, next, 'register'),
  async (req, res, next) => {
    const {username, password, email} = req.body;
    try {
      const user = await User.findOne({$or: [{username}, {email}]});
      if (user) {
        return res.json({
          status: 409,
          message: 'Registration Error: A user with that e-mail or username already exists.'
        });
      }
      const newUser = await new User({
        username,
        password,
        email
      }).save();
      return res.json({success: true, id: newUser._id});
    } catch (error) {
      return next(error);
    }
  });

// user authentication (POST)
router.post('/authenticate',
  (req, res, next) => validation(req, res, next, 'authenticate'),
  async (req, res, next) => {
    const {username, password} = req.body;
    try {
      const user = await User.findOne({username}).select('+password');
      if (!user) {
        return res.json({
          status: 401,
          message: 'Authentication Error: User not found.'
        });
      }
      if (!user.comparePassword(password, user.password)) {
        return res.json({
          status: 401,
          message: 'Authentication Error: Password does not match!'
        });
      }
      return res.json({
        user: {
          username, 
          id: user._id, 
          email: user.email
        },
        token: jwtSign({username, id: user._id, email: user.email})
      });
    } catch (error) {
      return next(error);
    }
  });

// reset a password (POST)
router.post('/resetpassword',
  (req, res, next) => validation(req, res, next, 'request'),
  async (req, res, next) => {
    const {username} = req.body;
    try {
      const user = await User.findOne({username});
      if (!user) {
        return res.json({
          status: 404,
          message: 'Resource Error: User not found.'
        });
      }
      const token = jwtSign({username});
      await Reset.findOneAndRemove({username});
      await new Reset({
        username,
        token,
      }).save();

      const email = mail(token);
      send(user.email, 'Forgot Password', email);
      return res.json({
        ok: true,
        message: 'Forgot password e-mail sent.'
      });
    } catch (error) {
      return next(error);
    }
  });

// change user's password (POST)
router.post('/changepassword',
  (req, res, next) => validation(req, res, next, 'change'),
  authorization,
  async (req, res, next) => {
    const {password} = req.body;
    const {username} = req.decoded;
    try {
      const user = await User.findOne({username});
      if (!user) {
        return res.json({
          status: 404,
          message: 'Resource Error: User not found.'
        });
      }
      const reset = await Reset.findOneAndRemove({username});
      if (!reset) {
        return res.json({
          status: 410,
          message: ' Resource Error: Reset token has expired.'
        });
      }
      user.password = password;
      await user.save();
      return res.json({
        ok: true,
        message: 'Password was changed.'
      });
    } catch (error) {
      return next(error);
    }
  });

module.exports = router;

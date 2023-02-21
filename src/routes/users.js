const express = require('express');
const {validation, authorization} = require('../middlewares');
const {helpers: {jwtSign}} = require('../utilities/authentication');

const {mailer: {mail, send}} = require('../utilities');

const router = express.Router();

const User = require('../models/user');
const Reset = require('../models/reset');

/*
POST /create
Create user route
*/
router.post('/create',
  (req, res, next) => validation(req, res, next, 'register'),
  async (req, res, next) => {
    
    // Gathering information for the user from body
    const {username, password, email} = req.body;
    try {
      const user = await User.findOne({$or: [{username}, {email}]});
      
      // Check whether there is another user with the same email
      if (user) {
        return res.json({
          status: 409,
          message: 'Registration Error: A user with that e-mail or username already exists.'
        });
      }

      // Create the new user
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


/*
POST /authenticate
Authenticate a user
*/
router.post('/authenticate',
  (req, res, next) => validation(req, res, next, 'authenticate'),
  async (req, res, next) => {
    
    // Gathering username and password from body
    const {username, password} = req.body;
    try {
      const user = await User.findOne({username}).select('+password');
      
      // Check whether the user exists
      if (!user) {
        return res.json({
          status: 401,
          message: 'Authentication Error: User not found.'
        });
      }
      
      // Check if the password is correct
      if (!user.comparePassword(password, user.password)) {
        return res.json({
          status: 401,
          message: 'Authentication Error: Password does not match!'
        });
      }
      
      // Authenticate and assign token
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


/*
POST /resetpassword
Reset a password
*/
router.post('/resetpassword',
  (req, res, next) => validation(req, res, next, 'request'),
  async (req, res, next) => {
    
    // Gatherning information from body: username
    const {username} = req.body;
    try {
      const user = await User.findOne({username});
      
      // Check if the user exists
      if (!user) {
        return res.json({
          status: 404,
          message: 'Resource Error: User not found.'
        });
      }

      // Resseting the token
      const token = jwtSign({username});
      await Reset.findOneAndRemove({username});
      await new Reset({
        username,
        token,
      }).save();

      // Asking the user to enter their email in order to reset their password
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


/*
POST /changepassword
Change password route
*/
router.post('/changepassword',
  (req, res, next) => validation(req, res, next, 'change'),
  
  // User authentication based on their username and password
  authorization,
  async (req, res, next) => {
    const {password} = req.body;
    const {username} = req.decoded;
    try {
      const user = await User.findOne({username});
      
      // Check if the user exists
      if (!user) {
        return res.json({
          status: 404,
          message: 'Resource Error: User not found.'
        });
      }
      const reset = await Reset.findOneAndRemove({username});
      
      // Check if the token has expired
      if (!reset) {
        return res.json({
          status: 410,
          message: ' Resource Error: Reset token has expired.'
        });
      }

      // Setting up a new password
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

// Export router
module.exports = router;

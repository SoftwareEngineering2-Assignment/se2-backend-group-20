/**
 * Actions taken when each dashboard route is called via a url
 */
/* eslint-disable max-len */
const express = require('express');
const mongoose = require('mongoose');
const {authorization} = require('../middlewares');

const router = express.Router();

const Dashboard = require('../models/dashboard');
const Source = require('../models/source');

// simply get the available dashboards (GET)
router.get('/dashboards',
  // first give authorization if possible
  authorization,
  // find available dashboards
  async (req, res, next) => {
    try {
      const {id} = req.decoded;
      const foundDashboards = await Dashboard.find({owner: mongoose.Types.ObjectId(id)});
      const dashboards = [];
      foundDashboards.forEach((s) => {
        dashboards.push({
          id: s._id,
          name: s.name,
          views: s.views
        });
      });

      // return dashboards
      return res.json({
        success: true,
        dashboards
      });
    } catch (err) {
      // in case of error
      return next(err.body);
    }
  });

// route for creating a dashboard (POST)
router.post('/create-dashboard',
  // first give authorization if possible
  authorization,
  async (req, res, next) => {
    try {
      // create a new dashboard using the posted information
      const {name} = req.body;
      const {id} = req.decoded;
      const foundDashboard = await Dashboard.findOne({owner: mongoose.Types.ObjectId(id), name});
      if (foundDashboard) {
        return res.json({
          status: 409,
          message: 'A dashboard with that name already exists.'
        });
      }
      await new Dashboard({
        name,
        layout: [],
        items: {},
        nextId: 1,
        owner: mongoose.Types.ObjectId(id)
      }).save();

      // inform the user of the successful dashboard creation
      return res.json({success: true});
    } catch (err) {
      // in case of error
      return next(err.body);
    }
  }); 

// route for deleting a dashboard (POST)
router.post('/delete-dashboard', 
  authorization,
  // first give authorization if possible
  async (req, res, next) => {
    try {
      const {id} = req.body;

      // find and delete the specific dashboard
      const foundDashboard = await Dashboard.findOneAndRemove({_id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id)});
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The selected dashboard has not been found.'
        });
      }

      // inform the user of the successful deletion
      return res.json({success: true});
    } catch (err) {
      // in case of error
      return next(err.body);
    }
  }); 

// route for getting a specific dashboard and sources (GET)
router.get('/dashboard',
  // first give authorization if possible
  authorization,
  async (req, res, next) => {
    try {
      const {id} = req.query;

      // select a dashboard
      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id)});
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The selected dashboard has not been found.'
        });
      }

      const dashboard = {};
      dashboard.id = foundDashboard._id;
      dashboard.name = foundDashboard.name;
      dashboard.layout = foundDashboard.layout;
      dashboard.items = foundDashboard.items;
      dashboard.nextId = foundDashboard.nextId;

      const foundSources = await Source.find({owner: mongoose.Types.ObjectId(req.decoded.id)});
      const sources = [];
      foundSources.forEach((s) => {
        sources.push(s.name);
      });
    
      // return dashboard and sources
      return res.json({
        success: true,
        dashboard,
        sources
      });
    } catch (err) {
      // in case of error
      return next(err.body);
    }
  });

// route for saving a created dashboard (POST)
router.post('/save-dashboard', 
  authorization,
  // first give authorization if possible
  async (req, res, next) => {
    try {
      const {id, layout, items, nextId} = req.body;

      // save the specific dashboard
      const result = await Dashboard.findOneAndUpdate({_id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id)}, {
        $set: {
          layout,
          items,
          nextId
        }
      }, {new: true});

      // there is no such dashboard
      if (result === null) {
        return res.json({
          status: 409,
          message: 'The selected dashboard has not been found.'
        });
      }

      // the saving was successful
      return res.json({success: true});
    } catch (err) {
      // in case of error
      return next(err.body);
    }
  });

// route for cloning/copying a dashboard (POST)
router.post('/clone-dashboard',
  // first give authorization if possible
  authorization,
  async (req, res, next) => {
    try {
      const {dashboardId, name} = req.body;

      const foundDashboard = await Dashboard.findOne({owner: mongoose.Types.ObjectId(req.decoded.id), name});
      if (foundDashboard) {
        return res.json({
          status: 409,
          message: 'A dashboard with that name already exists.'
        });
      }

      // cloning procedure
      const oldDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId), owner: mongoose.Types.ObjectId(req.decoded.id)});
      
      await new Dashboard({
        name,
        layout: oldDashboard.layout,
        items: oldDashboard.items,
        nextId: oldDashboard.nextId,
        owner: mongoose.Types.ObjectId(req.decoded.id)
      }).save();

      // successful cloning
      return res.json({success: true});
    } catch (err) {
      // in case of error
      return next(err.body);
    }
  });

// route for checking if user needs to put a password (POST)
router.post('/check-password-needed', 
  async (req, res, next) => {
    try {
      const {user, dashboardId} = req.body;
      const userId = user.id;

      // the specified dashboard has not been found
      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId)}).select('+password');
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }

      // specified dashboard found
      const dashboard = {};
      dashboard.name = foundDashboard.name;
      dashboard.layout = foundDashboard.layout;
      dashboard.items = foundDashboard.items;

      // if this is one of my dashboards
      if (userId && foundDashboard.owner.equals(userId)) {
        foundDashboard.views += 1;
        await foundDashboard.save();
    
        return res.json({
          success: true,
          owner: 'self',
          shared: foundDashboard.shared,
          hasPassword: foundDashboard.password !== null,
          dashboard
        });
      } 
      // dashboard not myne
      else if (!(foundDashboard.shared)) {
        return res.json({
          success: true,
          owner: '',
          shared: false
        });
      }
      // no password
      else if (foundDashboard.password === null) {
        foundDashboard.views += 1;
        await foundDashboard.save();
    
        return res.json({
          success: true,
          owner: foundDashboard.owner,
          shared: true,
          passwordNeeded: false,
          dashboard
        });
      }
      // return useful info
      return res.json({
        success: true,
        owner: '',
        shared: true,
        passwordNeeded: true
      });

    } catch (err) {
      // in case of error
      return next(err.body);
    }
  }); 

// route for password checking (POST)
router.post('/check-password', 
  async (req, res, next) => {
    try {
      const {dashboardId, password} = req.body;

      // specified dashboard not found
      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId)}).select('+password');
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }

      // wrong password
      if (!foundDashboard.comparePassword(password, foundDashboard.password)) {
        return res.json({
          success: true,
          correctPassword: false
        });
      }

      foundDashboard.views += 1;
      await foundDashboard.save();

      const dashboard = {};
      dashboard.name = foundDashboard.name;
      dashboard.layout = foundDashboard.layout;
      dashboard.items = foundDashboard.items;

      // dashboard found and sent
      return res.json({
        success: true,
        correctPassword: true,
        owner: foundDashboard.owner,
        dashboard
      });
    } catch (err) {
      // in case of error
      return next(err.body);
    }
  }); 

// route for sharing a dashboard (POST)
router.post('/share-dashboard',
  // give authorization if possible
  authorization,
  async (req, res, next) => {
    try {
      const {dashboardId} = req.body;
      const {id} = req.decoded;

      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId), owner: mongoose.Types.ObjectId(id)});

      // specified dashboard not found
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }
      foundDashboard.shared = !(foundDashboard.shared);
      
      await foundDashboard.save();

      // successful sharing
      return res.json({
        success: true,
        shared: foundDashboard.shared
      });
    } catch (err) {
      // in case of error
      return next(err.body);
    }
  }); 

// route for changing my password (POST)
router.post('/change-password', 
  // give authorization if possible
  authorization,
  async (req, res, next) => {
    try {
      const {dashboardId, password} = req.body;
      const {id} = req.decoded;

      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId), owner: mongoose.Types.ObjectId(id)});
      // specified dashboard not found
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }

      // password change
      foundDashboard.password = password;
      
      await foundDashboard.save();

      // successful password change
      return res.json({success: true});
    } catch (err) {
      // in case of error
      return next(err.body);
    }
  }); 

module.exports = router;

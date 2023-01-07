/* eslint-disable max-len */
const express = require('express');
const mongoose = require('mongoose');
const {authorization} = require('../middlewares');

const router = express.Router();

const Dashboard = require('../models/dashboard');
const Source = require('../models/source');

// simply get the available dashboards
router.get('/dashboards',
  authorization,
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

      return res.json({
        success: true,
        dashboards
      });
    } catch (err) {
      return next(err.body);
    }
  });

// route for creating a dashboard
router.post('/create-dashboard', 
  authorization,
  async (req, res, next) => {
    try {
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

      return res.json({success: true});
    } catch (err) {
      return next(err.body);
    }
  }); 

// route for deleting a dashboard
router.post('/delete-dashboard', 
  authorization,
  async (req, res, next) => {
    try {
      const {id} = req.body;

      const foundDashboard = await Dashboard.findOneAndRemove({_id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id)});
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The selected dashboard has not been found.'
        });
      }
      return res.json({success: true});
    } catch (err) {
      return next(err.body);
    }
  }); 

// route for getting a specific dashboard
router.get('/dashboard',
  authorization,
  async (req, res, next) => {
    try {
      const {id} = req.query;

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
    
      return res.json({
        success: true,
        dashboard,
        sources
      });
    } catch (err) {
      return next(err.body);
    }
  });

// route for saving a created dashboard
router.post('/save-dashboard', 
  authorization,
  async (req, res, next) => {
    try {
      const {id, layout, items, nextId} = req.body;

      const result = await Dashboard.findOneAndUpdate({_id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id)}, {
        $set: {
          layout,
          items,
          nextId
        }
      }, {new: true});

      if (result === null) {
        return res.json({
          status: 409,
          message: 'The selected dashboard has not been found.'
        });
      }
      return res.json({success: true});
    } catch (err) {
      return next(err.body);
    }
  });

// route for cloning/copying a dashboard
router.post('/clone-dashboard', 
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

      const oldDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId), owner: mongoose.Types.ObjectId(req.decoded.id)});
      
      await new Dashboard({
        name,
        layout: oldDashboard.layout,
        items: oldDashboard.items,
        nextId: oldDashboard.nextId,
        owner: mongoose.Types.ObjectId(req.decoded.id)
      }).save();

      return res.json({success: true});
    } catch (err) {
      return next(err.body);
    }
  }); 

// check password needed function
const x = async function (userId, foundDashboard, next) {
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
  else if (!(foundDashboard.shared)) {
    return res.json({
      success: true,
      owner: '',
      shared: false
    });
  }
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
  return res.json({
    success: true,
    owner: '',
    shared: true,
    passwordNeeded: true
  });
}

// route for checking if user needs to put a password
router.post('/check-password-needed', 
  async (req, res, next) => {
    try {
      const {user, dashboardId} = req.body;
      const userId = user.id;

      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId)}).select('+password');
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }

      const dashboard = {};
      dashboard.name = foundDashboard.name;
      dashboard.layout = foundDashboard.layout;
      dashboard.items = foundDashboard.items;

      const retobj = x(userId, foundDashboard, next);

    } catch (err) {
      return next(err.body);
    }
  }); 

// route for password checking
router.post('/check-password', 
  async (req, res, next) => {
    try {
      const {dashboardId, password} = req.body;

      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId)}).select('+password');
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }
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

      return res.json({
        success: true,
        correctPassword: true,
        owner: foundDashboard.owner,
        dashboard
      });
    } catch (err) {
      return next(err.body);
    }
  }); 

// route for sharing a dashboard
router.post('/share-dashboard', 
  authorization,
  async (req, res, next) => {
    try {
      const {dashboardId} = req.body;
      const {id} = req.decoded;

      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId), owner: mongoose.Types.ObjectId(id)});
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }
      foundDashboard.shared = !(foundDashboard.shared);
      
      await foundDashboard.save();

      return res.json({
        success: true,
        shared: foundDashboard.shared
      });
    } catch (err) {
      return next(err.body);
    }
  }); 

// route for changing my password
router.post('/change-password', 
  authorization,
  async (req, res, next) => {
    try {
      const {dashboardId, password} = req.body;
      const {id} = req.decoded;

      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId), owner: mongoose.Types.ObjectId(id)});
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }
      foundDashboard.password = password;
      
      await foundDashboard.save();

      return res.json({success: true});
    } catch (err) {
      return next(err.body);
    }
  }); 

module.exports = router;

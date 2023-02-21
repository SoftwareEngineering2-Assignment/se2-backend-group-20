/* eslint-disable max-len */
const express = require('express');
const mongoose = require('mongoose');
const {authorization} = require('../middlewares');

const router = express.Router();

const Dashboard = require('../models/dashboard');
const Source = require('../models/source');

/*
Get all the dashboards that have been created
*/
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

/*
Create a dashboard
*/
router.post('/create-dashboard', 
  authorization,
  async (req, res, next) => {
    try {
      const {name} = req.body;
      const {id} = req.decoded;
      
      // Already existing dashboard
      const foundDashboard = await Dashboard.findOne({owner: mongoose.Types.ObjectId(id), name});
      if (foundDashboard) {
        return res.json({
          status: 409,
          message: 'A dashboard with that name already exists.'
        });
      }
      // Giving the necessary info for dashboard creation
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

/*
Delete a dashboard based on the dashboard id
*/
router.post('/delete-dashboard', 
  authorization,
  async (req, res, next) => {
    try {
      const {id} = req.body;
      
      const foundDashboard = await Dashboard.findOneAndRemove({_id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id)});
      
      //Not existing dashboard
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


/*
Get a specific dashboard based on its id
*/
router.get('/dashboard',
  authorization,
  async (req, res, next) => {
    try {
      const {id} = req.query;

      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id)});
      
      //Not existing dashboard
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The selected dashboard has not been found.'
        });
      }

      //Gathering dashboard information
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
      
      //Return the dashboard
      return res.json({
        success: true,
        dashboard,
        sources
      });
    } catch (err) {
      return next(err.body);
    }
  });


/*
Save a dashboard
*/
router.post('/save-dashboard', 
  authorization,
  async (req, res, next) => {
    try {
      // Gathering the information from body
      const {id, layout, items, nextId} = req.body;

      // Getting the result
      const result = await Dashboard.findOneAndUpdate({_id: mongoose.Types.ObjectId(id), owner: mongoose.Types.ObjectId(req.decoded.id)}, {
        $set: {
          layout,
          items,
          nextId
        }
      }, {new: true});

      // Not existing dashboard
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


/*
Clone a dashboard
*/
router.post('/clone-dashboard', 
  authorization,
  async (req, res, next) => {
    // Collecting the information from body
    try {
      const {dashboardId, name} = req.body;

      // Getting the result
      const foundDashboard = await Dashboard.findOne({owner: mongoose.Types.ObjectId(req.decoded.id), name});
      
      // Exception: that dashboard already exists
      if (foundDashboard) {
        return res.json({
          status: 409,
          message: 'A dashboard with that name already exists.'
        });
      }

      const oldDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId), owner: mongoose.Types.ObjectId(req.decoded.id)});
      
      // Creating the new dashboard using the necessary info from the cloned dashboard
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


/*
Check the password for a given dashboard
*/
router.post('/check-password-needed', 
  async (req, res, next) => {
    try {
      const {user, dashboardId} = req.body;
      const userId = user.id;

      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId)}).select('+password');
      
      // Not existing dashboard
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
      
      // Check if the owner of the dashboard is the same as user based on user_id
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
      
      // Check if the dashboard is shared
      if (!(foundDashboard.shared)) {
        return res.json({
          success: true,
          owner: '',
          shared: false
        });
      }

      // Check if the dashboard has a password
      if (foundDashboard.password === null) {
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
    } catch (err) {
      return next(err.body);
    }
  }); 


/*
Check the password for a specific dashboard
*/
router.post('/check-password', 
  async (req, res, next) => {
    // Collect the information from body
    try {
      const {dashboardId, password} = req.body;

      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId)}).select('+password');
      
      // Not existing dashboard
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }
      
      // Compare the given password with the existing one for the dashboard
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


/*
Share a dashboard
*/
router.post('/share-dashboard', 
  authorization,
  async (req, res, next) => {
    
    // Gathering the information from body
    try {
      const {dashboardId} = req.body;
      const {id} = req.decoded;

      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId), owner: mongoose.Types.ObjectId(id)});
      
      // Not existing dashboard
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }
      
      // Changing the shared status to the opposite one: if shared then it should
      // change to not shared, and if not shared the status should be changed to 
      // shared
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


/*
Change the password for a dashboard
*/
router.post('/change-password', 
  authorization,
  async (req, res, next) => {
    
    // Gathering the information from body
    try {
      const {dashboardId, password} = req.body;
      const {id} = req.decoded;

      const foundDashboard = await Dashboard.findOne({_id: mongoose.Types.ObjectId(dashboardId), owner: mongoose.Types.ObjectId(id)});
      
      // Not existing dashboard
      if (!foundDashboard) {
        return res.json({
          status: 409,
          message: 'The specified dashboard has not been found.'
        });
      }

      // Set the new password for the dashboard
      foundDashboard.password = password;
      
      // Save changes
      await foundDashboard.save();

      return res.json({success: true});
    } catch (err) {
      return next(err.body);
    }
  }); 

// Exporting the route
module.exports = router;

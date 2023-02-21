/* eslint-disable max-len */
const express = require('express');
const got = require('got');

const router = express.Router();

const User = require('../models/user');
const Dashboard = require('../models/dashboard');
const Source = require('../models/source');


/*
Get the statistisc provided by Codin
*/
router.get('/statistics',
  async (res, next) => {
    /*
    Count users, documents and dashboards that have been created
    */
    try {
      const users = await User.countDocuments();
      const dashboards = await Dashboard.countDocuments();
      const views = await Dashboard.aggregate([
        {
          $group: {
            _id: null, 
            views: {$sum: '$views'}
          }
        }
      ]);
      const sources = await Source.countDocuments();

      let totalViews = 0;
      if (views[0] && views[0].views) {
        totalViews = views[0].views;
      }

      // Return a json with the statistics
      return res.json({
        success: true,
        users,
        dashboards,
        views: totalViews,
        sources
      });
    } catch (err) {
      return next(err.body);
    }
  });


/*
Test the connection based on a given url
*/
router.get('/test-url',
  async (req, res) => {
    // Check the url and return status code 200 if correct
    // else return status code 500 if incorrect
    try {
      const {url} = req.query;
      const {statusCode} = await got(url);
      return res.json({
        status: statusCode,
        active: (statusCode === 200),
      });
    } catch (err) {
      return res.json({
        status: 500,
        active: false,
      });
    }
  });


/*
Check the http request type
*/
router.get('/test-url-request',
  async (req, res) => {
    // Gathering the info
    try {
      const {url, type, headers, body: requestBody, params} = req.query;

      let statusCode;
      let body;
      
      /*
      A switch control flow for each http request:
      GET
      POST
      PUT
      Return status code = 500 if none of the above were provided
      */
      switch (type) {
        case 'GET':
          ({statusCode, body} = await got(url, {
            headers: headers ? JSON.parse(headers) : {},
            searchParams: params ? JSON.parse(params) : {}
          }));
          break;
        case 'POST':
          ({statusCode, body} = await got.post(url, {
            headers: headers ? JSON.parse(headers) : {},
            json: requestBody ? JSON.parse(requestBody) : {}
          }));
          break;
        case 'PUT':
          ({statusCode, body} = await got.put(url, {
            headers: headers ? JSON.parse(headers) : {},
            json: requestBody ? JSON.parse(requestBody) : {}
          }));
          break;
        default:
          statusCode = 500;
          body = 'Something went wrong';
      }
      
      // Success or Failure
      return res.json({
        status: statusCode,
        response: body,
      });
    } catch (err) {
      return res.json({
        status: 500,
        response: err.toString(),
      });
    }
  });

  // Export general route
module.exports = router;

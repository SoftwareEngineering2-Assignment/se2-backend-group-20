/**
 * configuration file
 */
const express = require('express');
const users = require('./users');
const sources = require('./sources');
const dashboards = require('./dashboards');
const general = require('./general');
const root = require('./root');

// start the router
const router = express.Router();

// use the specific routes
router.use('/users', users);
router.use('/sources', sources);
router.use('/dashboards', dashboards);
router.use('/general', general);
router.use('/', root);

module.exports = router;

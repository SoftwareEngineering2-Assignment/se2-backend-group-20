const express = require('express');
const users = require('./users');
const sources = require('./sources');
const dashboards = require('./dashboards');
const general = require('./general');
const root = require('./root');

// Setting up the router variable from express library
const router = express.Router();

// Rerouting accordingly
router.use('/users', users);
router.use('/sources', sources);
router.use('/dashboards', dashboards);
router.use('/general', general);
router.use('/', root);

// Export router
module.exports = router;

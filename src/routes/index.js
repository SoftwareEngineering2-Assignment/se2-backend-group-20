const express = require('express');
const users = require('./users');
const sources = require('./sources');
const dashboards = require('./dashboards');
const general = require('./general');
const root = require('./root');

const router = express.Router();

router.use('/users', users);
router.use('/sources', sources);
router.use('/dashboards', dashboards);
router.use('/general', general);
router.use('/', root);

module.exports = router;

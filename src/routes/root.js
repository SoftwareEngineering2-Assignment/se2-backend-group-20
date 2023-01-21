// Require express and path.
const express = require('express');
const path = require('path');

const router = express.Router();

// Sends the index. html file to the express module.
const file = path.join(__dirname, '../../index.html');
router.use(express.static(file));

router.get('/', (req, res) => res.sendFile(file));

module.exports = router;

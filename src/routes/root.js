const express = require('express');
const path = require('path');

const router = express.Router();

const file = path.join(__dirname, '../../index.html');
router.use(express.static(file));

router.get('/', (res) => res.sendFile(file));

module.exports = router;

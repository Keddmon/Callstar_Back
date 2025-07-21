const express = require('express');
const router = express.Router();
const { listSerialPorts } = require('../controllers/port.controller');

router.get('/ports', listSerialPorts);

module.exports = router;
const express = require('express');
const router = express.Router();

const { getConnectionStatus } = require('../controllers/status.controller');

router.get('/connection-status', getConnectionStatus);

module.exports = router;
/**
 * [2025. 07. 03.(목)]
 * - 상태 Router 분리
 */
const express = require('express');
const router = express.Router();

const { getConnectionStatus } = require('../controllers/status.controller');

router.get('/connection-status', getConnectionStatus);

module.exports = router;
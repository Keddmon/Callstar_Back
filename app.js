/**
 * 2025-07-03
 * [Express 설정]
 */
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const statusRoute = require('./routes/status.route');

const app = express();

app.use(cors());
app.use(bodyParser.json());

app.use('/api', statusRoute);

app.get('/', (req, res) => {
    res.send('CallStar CID API');
});

module.exports = app;
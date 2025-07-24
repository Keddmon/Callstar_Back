const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');


/* ===== ROUTER ===== */
const statusRoute = require('./routes/status.route');
const listSerialPorts = require('./routes/port.route');

const app = express();

app.use(cors());
app.use(bodyParser.json());

/* ===== APIS ===== */
app.use('/api', statusRoute);
app.use('/api', listSerialPorts);

app.get('/', (req, res) => {
    res.send('CallStar CID API');
});

module.exports = app;
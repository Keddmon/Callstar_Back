const { SerialPort } = require('serialport');

const listSerialPorts = async (req, res) => {
    try {
        const ports = await SerialPort.list();
        console.log(ports);
        const availablePorts = ports.map(p => p.friendlyName);
        res.json({ ports: availablePorts });
    } catch (err) {
        console.error('[controller][port.controller] Error listing ports: ', err);
        res.status(500).json({ error: 'Failed to list serial ports' });
    }
};

module.exports = { listSerialPorts };
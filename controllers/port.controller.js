const { SerialPort } = require('serialport');

const listSerialPorts = async (req, res) => {
    try {
        const ports = await SerialPort.list();

        const availablePorts = ports.map(p => ({
            label: p.friendlyName,
            value: p.path,
        }));

        res.json({ ports: availablePorts });
    } catch (err) {
        console.error('[controller][port.controller] Error listing ports: ', err);
        res.status(500).json({ error: 'Failed to list serial ports' });
    }
};

module.exports = { listSerialPorts };
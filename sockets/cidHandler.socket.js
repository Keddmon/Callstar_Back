/**
 * [2025. 07. 07.(월)]
 * - CID 소켓 핸들러 등록
 */
const { setupSerialPort, closeSerialPort } = require('../services/serialPort.service');

module.exports = (socket) => {
    console.log(`[sockets][cid.socket] 소켓 핸들러 등록 완료 - ID: ${socket.id}`);

    socket.on('client-ready', () => {
        console.log('[SOCKET] Client is ready, sending device request');
        const { sendCommand } = require('../services/serialPort.service');
        const { OPCODES } = require('../utils/protocol.constants');
        sendCommand('1', OPCODES.DEVICE_INFO);
    });

    socket.on('select-port', (port) => {
        console.log(`[SOCKET] Selected Port: ${port}`);
        closeSerialPort();
        setupSerialPort(socket.server, port);
    });
};